import superagent from 'superagent';
import supertest from 'supertest';
import { Any2Unknown } from './Any2Unknown';

export type SuperTestRequest = superagent.SuperAgentRequest;
export type SuperTestResponse = Any2Unknown<superagent.Response>;
export type SuperTestServer = supertest.SuperTest<supertest.Test>;
