import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler.middleware';
import cookieParser from 'cookie-parser';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setMiddlewares();
    this.setRoutes();
    this.setErrorHandler();
  }

  private setMiddlewares(): void {
    this.app.use(compression());
    this.app.use(
      rateLimit({
        windowMs: 10 * 60 * 1000, // 15 mins
        max: 30, // Limit each IP to 100 requests per windowMs
        message:
          'Too many requests from this IP, please try again after 15 minutes.',
      })
    );
    this.app.use(express.json());
    this.app.use(express.static('public'));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: 'http://localhost:4200', // your Angular app's origin
        credentials: true, // <-- allow credentials
      })
    );
    this.app.use(morgan('dev'));
    this.app.use(cookieParser());
  }

  private setRoutes(): void {
    this.app.get('/', (_req: Request, res: Response) => {
      res.send('API is running!');
    });
    // Add more routes here or import from separate files
  }

  private setErrorHandler(): void {
    this.app.use(errorHandler);
  }

  public getServer(): Application {
    return this.app;
  }
}
export default new App().getServer();
