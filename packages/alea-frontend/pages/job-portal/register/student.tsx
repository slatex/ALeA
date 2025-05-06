import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  canAccessResource,
  createStudentProfile,
  getStudentProfile,
  StudentData,
} from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { useRouter } from 'next/router';
import MainLayout from 'packages/alea-frontend/layouts/MainLayout';
import { useEffect, useState } from 'react';

export default function StudentRegistration() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState<StudentData>({
    name: '',
    resumeURL: '',
    email: '',
    contactNo: '',
    programme: '',
    yearOfAdmission: '',
    yearOfGraduation: '',
    courses: '',
    grades: '',
    about: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    contactNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [accessCheckLoading, setAccessCheckLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setAccessCheckLoading(true);
      const hasAccess = await canAccessResource(ResourceName.JOB_PORTAL, Action.APPLY, {
        instanceId: CURRENT_TERM,
      });
      if (!hasAccess) {
        alert('You donot have access to this page.');
        router.push('/job-portal');
        return;
      }
      setAccessCheckLoading(false);
    };

    checkAccess();
  }, []);

  // useEffect(() => {
  //   const fetchStudentData = async () => {
  //     try {
  //       setLoading(true);

  //       if (accessCheckLoading) {
  //         return;
  //       }

  //       const res = await getStudentProfile();

  //       if (!res) {
  //         setIsRegistered(false);
  //         return;
  //       }

  //       setIsRegistered(!!res[0]);
  //     } catch (error) {
  //       console.error('Error fetching student data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchStudentData();
  // }, [accessCheckLoading]);

  useEffect(() => {
    setLoading(true);
    if (accessCheckLoading) return;
    const fetchStudentData = async () => {
      try {
        const res = await getStudentProfile();
        if (!res) {
          setIsRegistered(false);
          return;
        }
        setIsRegistered(!!res[0]);
      } catch (error) {
        console.error('Error fetching recruiter data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [accessCheckLoading]);

  if (accessCheckLoading || loading) {
    return <CircularProgress color="primary" />;
  }
  if (isRegistered) {
    return <Alert severity="info">You are already registered.</Alert>;
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateFields = () => {
    const newErrors = { email: '', contactNo: '' };

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.contactNo || !/^\d{10,15}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Please enter a valid contact number (10-15 digits).';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.contactNo;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    await createStudentProfile(formData);
    router.push('/job-portal/student-dashboard');
  };

  return (
    <MainLayout title="Register-Student | VoLL-KI">
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Box
          sx={{
            textAlign: 'center',
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Student Registration
          </Typography>

          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Contact Number"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            type="tel"
            fullWidth
            margin="normal"
            error={!!errors.contactNo}
            helperText={errors.contactNo}
          />
          <TextField
            label="Programme"
            name="programme"
            value={formData.programme}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Year of Admission"
            name="yearOfAdmission"
            value={formData.yearOfAdmission}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Year of Graduation"
            name="yearOfGraduation"
            value={formData.yearOfGraduation}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Courses"
            name="courses"
            value={formData.courses}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            margin="normal"
            placeholder="Enter your courses separated by commas"
          />
          <TextField
            label="Grades"
            name="grades"
            value={formData.grades}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            margin="normal"
            placeholder="Enter grades corresponding to the courses"
          />
          <TextField
            label="About Yourself"
            name="about"
            value={formData.about}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Resume URL"
            name="resumeURL"
            value={formData.resumeURL}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
