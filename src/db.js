import mysql from 'mysql';

// connect mysql
export default mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: '52dachu'
});
