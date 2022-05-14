import superagent from 'superagent';
import { Any2Unknown } from './Any2Unknown';

export type SafeResponse = Any2Unknown<superagent.Response>;
