import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Module({
    exports: [MessagesService],
    providers: [MessagesService],
})
export class MessagesModule {}
