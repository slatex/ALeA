import { FTMLFragment } from '@kwarc/ftml-react';
import { FTML } from '@kwarc/ftml-viewer';
import { VideoCameraBack } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  canAccessResource,
  ClipData,
  ClipInfo,
  getCourseInfo,
  getDocumentSections,
  getSlideCounts,
  getSlideDetails,
  getSlideUriToIndexMapping,
  SectionInfo,
  Slide,
} from '@stex-react/api';
import { CommentNoteToggleView } from '@stex-react/comments';
import { SafeHtml } from '@stex-react/react-utils';
import {
  ContentDashboard,
  LayoutWithFixedMenu,
  SectionReview,
} from '@stex-react/stex-react-renderer';
import {
  Action,
  CourseInfo,
  CURRENT_TERM,
  localStore,
  ResourceName,
  shouldUseDrawer,
} from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { getSlideUri, SlideDeck } from '../../components/SlideDeck';
import { SlidesUriToIndexMap, VideoDisplay } from '../../components/VideoDisplay';
import { getLocaleObject } from '../../lang/utils';
import MainLayout from '../../layouts/MainLayout';
import QuizComponent from 'packages/alea-frontend/components/GenerateQuiz';

function RenderElements({ elements }: { elements: string[] }) {
  return (
    <>
      {elements.map((e, idx) => (
        <Fragment key={idx}>
          <FTMLFragment fragment={{ type: 'HtmlString', html: e }} />
          {idx < elements.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

export enum ViewMode {
  SLIDE_MODE = 'SLIDE_MODE',
  COMBINED_MODE = 'COMBINED_MODE',
}
function ToggleModeButton({
  viewMode,
  updateViewMode,
}: {
  viewMode: ViewMode;
  updateViewMode: (mode: ViewMode) => void;
}) {
  const router = useRouter();
  const { courseView: t } = getLocaleObject(router);

  const isCombinedMode = viewMode === ViewMode.COMBINED_MODE;
  const buttonLabel = isCombinedMode ? t.hideVideo : t.showVideo;

  return (
    <Button
      variant="outlined"
      onClick={() => {
        const newMode = isCombinedMode ? ViewMode.SLIDE_MODE : ViewMode.COMBINED_MODE;
        updateViewMode(newMode);
      }}
      sx={{
        m: '5px 0',
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'white',
        },
      }}
    >
      {buttonLabel}
      <VideoCameraBack sx={{ ml: '5px' }} />
    </Button>
  );
}

function populateClipIds(sections: SectionInfo[], clipIds: { [sectionId: string]: string }) {
  for (const section of sections) {
    clipIds[section.id] = section.clipId;
    populateClipIds(section.children, clipIds);
  }
}

function populateSlidesClipInfos(
  sections: SectionInfo[],
  slidesClipInfo: {
    [sectionId: string]: {
      [slideUri: string]: ClipInfo[];
    };
  }
) {
  for (const section of sections) {
    slidesClipInfo[section.id] = section.clipInfo;
    populateSlidesClipInfos(section.children, slidesClipInfo);
  }
}

export function setSlideNumAndSectionId(router: NextRouter, slideNum: number, sectionId?: string) {
  const { pathname, query } = router;
  const courseId = query.courseId as string;
  if (sectionId) {
    query.sectionId = sectionId;
    localStore?.setItem(`lastReadSectionId-${courseId}`, sectionId);
  }
  query.slideNum = `${slideNum}`;
  localStore?.setItem(`lastReadSlideNum-${courseId}`, `${slideNum}`);
  router.push({ pathname, query });
}

function getSections(tocElems: FTML.TOCElem[]): string[] {
  const sectionIds: string[] = [];
  for (const tocElem of tocElems) {
    if (tocElem.type === 'Section') {
      sectionIds.push(tocElem.id);
    }
    if ('children' in tocElem) {
      sectionIds.push(...getSections(tocElem.children));
    }
  }
  return sectionIds;
}

function findSection(
  toc: FTML.TOCElem[],
  sectionId: string
): Extract<FTML.TOCElem, { type: 'Section' }> | undefined {
  for (const tocElem of toc) {
    if (tocElem.type === 'Section' && tocElem.id === sectionId) {
      return tocElem;
    }
    if ('children' in tocElem) {
      const result = findSection(tocElem.children, sectionId);
      if (result) return result;
    }
  }
  return undefined;
}

const CourseViewPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const sectionId = router.query.sectionId as string;
  const slideNum = +((router.query.slideNum as string) || 0);
  const viewModeStr = router.query.viewMode as string;
  const viewMode = ViewMode[viewModeStr as keyof typeof ViewMode];
  const audioOnlyStr = router.query.audioOnly as string;
  const audioOnly = audioOnlyStr === 'true';

  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [preNotes, setPreNotes] = useState([] as string[]);
  const [postNotes, setPostNotes] = useState([] as string[]);
  const [courseSections, setCourseSections] = useState<string[]>([]);
  const [slideCounts, setSlideCounts] = useState<{
    [sectionId: string]: number;
  }>({});
  const [slidesUriToIndexMap, setSlidesUriToIndexMap] = useState<SlidesUriToIndexMap>({});

  const [clipIds, setClipIds] = useState<{ [sectionId: string]: string }>({});
  const [slidesClipInfo, setSlidesClipInfo] = useState<{
    [sectionId: string]: {
      [slideUri: string]: ClipInfo[];
    };
  }>({});
  const [currentClipId, setCurrentClipId] = useState('');
  const [videoExtractedData, setVideoExtractedData] = useState<{
    [timestampSec: number]: ClipData;
  }>({});

  const [currentSlideClipInfo, setCurrentSlideClipInfo] = useState<ClipInfo>(null);
  const { courseView: t, home: tHome } = getLocaleObject(router);
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo } | undefined>(undefined);
  const [timestampSec, setTimestampSec] = useState(0);
  const [autoSync, setAutoSync] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [toc, setToc] = useState<FTML.TOCElem[]>([]);
  const [currentSlideUri, setCurrentSlideUri] = useState<string>('');
  const [isQuizMaker, setIsQUizMaker] = useState(false);

  const selectedSectionTOC = useMemo(() => {
    return findSection(toc, sectionId);
  }, [toc, sectionId]);

  const handleVideoLoad = (status) => {
    setVideoLoaded(status);
  };

  useEffect(() => {
    if (!courseId) return;
    const checkAccess = async () => {
      const hasAccess = await canAccessResource(ResourceName.COURSE_QUIZ, Action.MUTATE, {
        courseId,
        instanceId: CURRENT_TERM,
      });
      setIsQUizMaker(hasAccess);
    };
    checkAccess();
  }, [courseId]);

  useEffect(() => {
    getCourseInfo().then(setCourses);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const notes = courses?.[courseId]?.notes;
    if (!notes) return;
    getDocumentSections(notes).then(([css, toc]) => {
      setToc(toc);
      setCourseSections(getSections(toc));
      for (const e of css) FTML.injectCss(e);
    });
    getSlideCounts(courseId).then(setSlideCounts);
    getSlideUriToIndexMapping(courseId).then(setSlidesUriToIndexMap);
  }, [router.isReady, courses, courseId]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length) return;
    axios.get(`/api/get-section-info/${courseId}`).then((r) => {
      const clipIds = {};
      populateClipIds(r.data, clipIds);
      setClipIds(clipIds);
      const slidesClipInfo = {};
      populateSlidesClipInfos(r.data, slidesClipInfo);
      setSlidesClipInfo(slidesClipInfo);
    });
  }, [courseId, router.isReady]);

  useEffect(() => {
    if (!router.isReady || !courseId?.length || !currentClipId) return;
    getSlideDetails(courseId, currentClipId).then(setVideoExtractedData);
  }, [courseId, currentClipId, router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    if (sectionId && slideNum && viewMode && audioOnlyStr) return;
    const { pathname, query } = router;
    let someParamMissing = false;
    if (!sectionId) {
      someParamMissing = true;
      const inStore = localStore?.getItem(`lastReadSectionId-${courseId}`);
      if (inStore?.length) {
        query.sectionId = inStore;
      } else {
        const firstSection = Object.keys(slideCounts)?.[0];
        if (firstSection) query.sectionId = firstSection;
      }
    }
    if (!slideNum) {
      someParamMissing = true;
      query.slideNum = localStore?.getItem(`lastReadSlideNum-${courseId}`) || '1';
    }
    if (!viewMode) {
      someParamMissing = true;
      query.viewMode = localStore?.getItem('defaultMode') || ViewMode.COMBINED_MODE.toString();
    }
    if (!audioOnlyStr) {
      someParamMissing = true;
      query.audioOnly = localStore?.getItem('audioOnly') || 'false';
    }
    if (someParamMissing) router.replace({ pathname, query });
  }, [router, router.isReady, sectionId, slideNum, viewMode, courseId, audioOnlyStr, slideCounts]);

  useEffect(() => {
    if (!sectionId) return;
    const newClipId = clipIds?.[sectionId];
    setCurrentClipId(newClipId);
  }, [slidesClipInfo, clipIds, sectionId]);

  function goToPrevSection() {
    const secIdx = courseSections.indexOf(sectionId);
    if (secIdx === -1 || secIdx === 0) return;
    const secId = courseSections[secIdx - 1];
    setSlideNumAndSectionId(router, slideCounts[secId] ?? -1, secId);
  }

  function goToNextSection() {
    const secIdx = courseSections.indexOf(sectionId);
    if (secIdx === -1 || secIdx + 1 >= courseSections.length) return;
    const secId = courseSections[secIdx + 1];
    setSlideNumAndSectionId(router, 1, secId);
  }

  if (!router.isReady || !courses) return <CircularProgress />;
  if (!courses[courseId]) {
    router.replace('/');
    return <>Course Not Found!</>;
  }
  const onClipChange = (clip: any) => {
    setCurrentClipId(clip.video_id);
    setTimestampSec(clip.start_time);
  };
  return (
    <MainLayout title={(courseId || '').toUpperCase() + ` ${tHome.courseThumb.slides} | ALeA`}>
      <LayoutWithFixedMenu
        menu={
          toc?.length > 0 && (
            <ContentDashboard
              key={courseId}
              courseId={courseId}
              toc={toc}
              selectedSection={sectionId}
              onClose={() => setShowDashboard(false)}
              onSectionClick={(sectionId: string) => {
                setAutoSync(false);
                setSlideNumAndSectionId(router, 1, sectionId);
              }}
            />
          )
        }
        topOffset={64}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        drawerAnchor="left"
      >
        <Box display="flex" minHeight="100svh">
          <Box maxWidth="800px" margin="0 auto" width="100%" pl="4px">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <ToggleModeButton
                viewMode={viewMode}
                updateViewMode={(mode) => {
                  const modeStr = mode.toString();
                  localStore?.setItem('defaultMode', modeStr);
                  router.query.viewMode = modeStr;
                  router.replace(router);
                }}
              />
              <Link href={courses[courseId]?.notesLink ?? ''} passHref>
                <Button size="small" variant="contained" sx={{ mr: '10px' }}>
                  {t.notes}&nbsp;
                  <ArticleIcon />
                </Button>
              </Link>
            </Box>
            <Box sx={{ marginBottom: '10px', marginTop: '10px' }}>
              <Typography variant="h6" sx={{ color: '#333' }}>
                <SafeHtml html={selectedSectionTOC?.title || '<i>...</i>'} />
              </Typography>
            </Box>
            {viewMode === ViewMode.COMBINED_MODE && (
              <VideoDisplay
                clipId={currentClipId}
                clipIds={clipIds}
                setCurrentClipId={setCurrentClipId}
                audioOnly={audioOnly}
                timestampSec={timestampSec}
                setTimestampSec={setTimestampSec}
                currentSlideClipInfo={currentSlideClipInfo}
                videoExtractedData={videoExtractedData}
                slidesUriToIndexMap={slidesUriToIndexMap}
                autoSync={autoSync}
                onVideoLoad={handleVideoLoad}
              />
            )}
            {(viewMode === ViewMode.SLIDE_MODE || viewMode === ViewMode.COMBINED_MODE) && (
              <SlideDeck
                navOnTop={viewMode === ViewMode.COMBINED_MODE}
                courseId={courseId}
                sectionId={sectionId}
                onSlideChange={(slide: Slide) => {
                  setPreNotes(slide?.preNotes.map((p) => p.html) || []);
                  setPostNotes(slide?.postNotes.map((p) => p.html) || []);
                  const slideUri = getSlideUri(slide);
                  setCurrentSlideUri(slideUri || '');
                  if (
                    slidesClipInfo &&
                    slidesClipInfo[sectionId] &&
                    slidesClipInfo[sectionId][slideUri]
                  ) {
                    const slideClips = slidesClipInfo[sectionId][slideUri];
                    if (!Array.isArray(slideClips)) {
                      return;
                    }
                    const matchedClip = slideClips.find((clip) => clip.video_id === currentClipId);
                    setCurrentSlideClipInfo(matchedClip || slideClips[0]);
                  } else setCurrentSlideClipInfo(null);
                }}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
                slideNum={slideNum}
                slidesClipInfo={slidesClipInfo}
                onClipChange={onClipChange}
                autoSync={autoSync}
                setAutoSync={setAutoSync}
                audioOnly={audioOnly}
                videoLoaded={videoLoaded}
              />
            )}
            <hr style={{ width: '98%', padding: '1px 0' }} />
            {selectedSectionTOC && (
              <Box sx={{ marginTop: '10px', marginBottom: '10px' }}>
                <SectionReview
                  sectionUri={selectedSectionTOC.uri}
                  sectionTitle={selectedSectionTOC.title}
                />
                {isQuizMaker && (
                  <QuizComponent key={sectionId} courseId={courseId} sectionId={sectionId} />
                )}
              </Box>
            )}
            <CommentNoteToggleView
              uri={currentSlideUri}
              defaultPrivate={true}
              extraPanel={{
                label: t.instructorNotes,
                panelContent: (
                  <Box p="5px" sx={{ overflowX: 'auto' }}>
                    <RenderElements elements={preNotes} />
                    {preNotes.length > 0 && postNotes.length > 0 && <hr style={{ width: '98%' }} />}
                    <RenderElements elements={postNotes} />
                  </Box>
                ),
              }}
            />
          </Box>
        </Box>
      </LayoutWithFixedMenu>
    </MainLayout>
  );
};

export default CourseViewPage;
