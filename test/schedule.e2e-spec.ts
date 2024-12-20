import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Types } from 'mongoose';
import { ScheduleDto } from '../src/schedule/dto/schedule.dto';
import { ScheduleStatus } from '../src/schedule/schedule.types';


let roomId: string = new Types.ObjectId().toHexString();
let scheduleId: string;

const scheduleDto: ScheduleDto = {
    startAt: "2024-12-16",
    endAt: "2024-12-18",
    status: ScheduleStatus.Pending,
    roomId,
}

describe('Schedule (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });

    it('/api/schedule/create (Post): success', async () => {
        return request(app.getHttpServer())
            .post('/api/schedule/create')
            .send(scheduleDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                scheduleId = body._id;
                expect(scheduleId).toBeDefined();
            })
    });

    it('/api/schedule/:id (Patch): success', async () => {
        return request(app.getHttpServer())
            .patch(`/api/schedule/${scheduleId}`)
            .send({ endAt: "2024-12-17" })
            .expect(200)
    });

    it('/api/schedule/updateStatus/:id/:status (Patch): success', async () => {
        return request(app.getHttpServer())
            .patch(`/api/schedule/updateStatus/${scheduleId}/1`)
            .expect(200)
    });

    it('/api/schedule/:id (Delete): success', async () => {
        return request(app.getHttpServer())
            .delete(`/api/schedule/${scheduleId}`)
            .expect(200)
    });

    it('/api/schedule/delete/:id (Delete): success', async () => {
        return request(app.getHttpServer())
            .delete(`/api/schedule/delete/${scheduleId}`)
            .expect(200)
    });

    afterAll(async () => {
        return disconnect();
    });

});