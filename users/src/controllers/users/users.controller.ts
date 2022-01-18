import express from "express";
import {
  BaseController,
  Controller,
  validationMiddleware,
  sanitizeBody,
  SuccessResponse,
  UsersDto,
  UserBodyInterface,
  UsersProps,
  UsersDB,
  VerifyDto,
  verifyProps,
  VerifyInterface,
  upload,
  auth,
} from "@ezzify/common/build";

import { UpdateUsersDto } from "../services/updateUser/updateUser.dto";
import { UpdateUsersProps } from "../services/updateUser/updateUser.props";
import { UpdatedUsersDB } from "../services/users.db";

export class UserController extends BaseController implements Controller {
  public path = "/users";
  public router = express.Router();

  private db: UsersDB;
  private userdb: UpdatedUsersDB;

  constructor() {
    super();
    this.db = new UsersDB();
    this.userdb = new UpdatedUsersDB();
    this._initializeRoutes();
  }

  private _initializeRoutes = () => {
    this.router.post(`${this.path}/signup`, validationMiddleware(UsersDto), this.signupUser);
    this.router.post(`${this.path}/verify`, validationMiddleware(VerifyDto), this.verifyUser);
    this.router.patch(`${this.path}/update_user`, validationMiddleware(UpdateUsersDto), upload.single("file"), auth(["user"]), this.updateUser);
     this.router.post(`${this.path}/book_service`, auth(["user"]), this.userBooking);
  };

  private signupUser = this.catchAsyn(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { email,role } = sanitizeBody(UsersProps, req.body);
      console.log(role);
      
    const result = await this.db.signupUser(email,role, res);

    new SuccessResponse("success", result).send(res);
  });

  private verifyUser = this.catchAsyn(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id, otp } = sanitizeBody(verifyProps, req.body) as VerifyInterface;

    const result = await this.db.verifyOtpService({ id, otp }, res);

    new SuccessResponse("success", result).send(res);
  });

  private updateUser = this.catchAsyn(async (req: any, res: express.Response, next: express.NextFunction) => {
    req.body = sanitizeBody(UpdateUsersProps, req.body);

    let newDetails = { ...req.body, profileImage: req?.file?.location };

    const result = await this.userdb.updateUserService(newDetails, req.user._id, res);
    new SuccessResponse("success", result).send(res);
  });

  private userBooking = this.catchAsyn(async (req: any, res: express.Response, next: express.NextFunction) => {
     let bookingData = { ...req.body};

     const bookService = await this.userdb.createBookingService(bookingData,req.user._id,res);

     new SuccessResponse("success", bookService).send(res);
  })
}
