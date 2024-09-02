import express from 'express';
import { body, param } from 'express-validator';
import WorkoutProgramsManagerServices from '../../Services/WorkoutProgramsManagerServices/WorkoutProgramsManagerServices';
const router = express.Router();

router.post('/upload-program', WorkoutProgramsManagerServices.UploadWorkoutProgram);

router.get('/get-program-data/:UserPrivateToken/:ProgramToken', param('ProgramToken').not().isEmpty(), WorkoutProgramsManagerServices.GetProgramData);
router.get('/get-all-programs/:UserPrivateToken', param('UserPrivateToken').not().isEmpty(), WorkoutProgramsManagerServices.GetAllPrograms);

router.post('/update-workout-program', WorkoutProgramsManagerServices.UpdateWorkoutProgram);
router.post('/delete-workout-program', body('ProgramToken').not().isEmpty(), body('UserPrivateToken').not().isEmpty(), WorkoutProgramsManagerServices.DeleteWorkoutProgram);

export = router;
