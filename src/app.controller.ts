import { Controller, Get, StreamableFile} from '@nestjs/common';
import { AppService } from './app.service';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // endpoint to stream file content to certbot for domain-validation in order to obtain ssl certificate
  @Get('.well-known/acme-challenge/etXtGCmW-s9toNNZP6SjO1dF-qqWlAbz7AdCuJJverw')
  cert_bot_manual_domain_validation(): StreamableFile{
    const file = createReadStream(join(process.cwd(), 'src/domain-validation-files/certbot.txt'));
    return new StreamableFile(file);
  }

}
