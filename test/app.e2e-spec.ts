import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

jest.mock('../generated/prisma/enums.js', () => ({
  AnnotationType: {
    positive: 'positive',
    negative: 'negative',
  },
}));

jest.mock('../generated/prisma/client.js', () => ({
  AnnotationType: {
    positive: 'positive',
    negative: 'negative',
  },
  PrismaClient: class PrismaClient {},
  Prisma: {
    Decimal: class Decimal {
      constructor(public readonly value: number) {}
    },
  },
}));

jest.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AnnotationsController } from '../src/annotations/annotations.controller';
import { AnnotationsService } from '../src/annotations/annotations.service';
import { GradesController } from '../src/grades/grades.controller';
import { GradesService } from '../src/grades/grades.service';
import { PrismaService } from '../src/prisma/prisma.service';

const prismaMock = {
  enrollment: {
    findFirst: jest.fn(),
  },
  courseSubject: {
    findUnique: jest.fn(),
  },
  grade: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  annotation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('Classbook Rules (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.annotation.findMany.mockResolvedValue([]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GradesController, AnnotationsController],
      providers: [
        GradesService,
        AnnotationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /grades rejects values out of 1.0-7.0', async () => {
    await request(app.getHttpServer())
      .post('/grades')
      .send({
        studentId: 1,
        courseId: 1,
        schoolYearId: 1,
        subjectId: 1,
        courseSubjectId: 1,
        teacherId: 1,
        title: 'Prueba fuera de rango',
        value: 7.5,
      })
      .expect(400);
  });

  it('GET /annotations forbids negative annotations for inspector', async () => {
    await request(app.getHttpServer())
      .get('/annotations?includeNegative=true&viewerRole=inspector')
      .expect(403);
  });

  it('GET /annotations allows negative annotations for teacher', async () => {
    await request(app.getHttpServer())
      .get('/annotations?includeNegative=true&viewerRole=teacher')
      .expect(200);
  });
});
