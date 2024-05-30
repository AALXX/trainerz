import { Response } from 'express';

import multer from 'multer';
import fs from 'fs';
import FFmpeg from 'fluent-ffmpeg';

import logging from '../../config/logging';
import { CustomRequest, query } from '../../config/mysql';

import UtilFunc from '../../util/utilFunctions';
import axios from 'axios';
import utilFunctions from '../../util/utilFunctions';
import { validationResult, param, body } from 'express-validator';

const NAMESPACE = 'CLIENT_VIDEO_SERVICES';
