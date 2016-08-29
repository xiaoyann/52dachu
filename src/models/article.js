import db from '../db';
import Promise from 'bluebird';


const TABLE_NAME = 'dc_post';


function formatWhere(where) {
  let _where = [];
  for (let k in where) {
    _where.push(`${k} = ${db.escape(where[k])}`);
  }
  return _where.join(' && ');
}


function promisify(sql) {
  return new Promise(function(resolve, reject) {
    db.query(sql, function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


export function count() {
  let sql = `SELECT count(id) FROM ${TABLE_NAME}`;
  return promisify(sql).then(rows => {
    return rows.length > 0 ? rows[0]['count(id)'] : 0;
  });
}


export function findByPathname(pathname) {
  let where = formatWhere({ pathname: pathname });
  let sql = `SELECT * FROM ${TABLE_NAME} WHERE ${where}`;
  return promisify(sql).then(rows => {
    return rows.length > 0 ? rows[0] : null;
  });
}


export async function findByPage(currentPage) {
  let pageSize = 2;
  let totals = await count();
  let totalPages = Math.ceil(totals / pageSize);
  let limit  = (currentPage - 1) * pageSize + ',' + pageSize;
  let sql = `SELECT * FROM ${TABLE_NAME} ORDER BY create_time DESC LIMIT ${limit}`;
  return promisify(sql).then(rows => ({ totals, rows, pageSize, currentPage, totalPages }));
}









