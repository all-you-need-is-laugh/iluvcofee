import { DataSource } from 'typeorm';

// TODO: read config from .env files
const dataSource = new DataSource({
  database: 'iluvcofee',
  entities: [ 'src/**/*.entity.ts' ],
  host: 'localhost',
  migrations: [ 'src/typeorm/migrations/*.ts' ],
  password: 'postgres',
  port: 5432,
  type: 'postgres',
  username: 'postgres'
});

export default dataSource;
