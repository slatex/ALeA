import { addLectureSchedule } from './addLectureSchedule';
import { quizLmsInfoWriter } from './quizLmsInfoWriter';
import { semesterSetupScript } from './semesterSetup';

switch (process.env.SCRIPT_NAME) {
  case 'quizLmsInfoWriter':
    quizLmsInfoWriter();
    break;
  case 'addLectureSchedule':
    addLectureSchedule();
    break;
  case 'semesterSetupScript':
    semesterSetupScript();
    break;
  default:
    console.log('Invalid script name');
}
