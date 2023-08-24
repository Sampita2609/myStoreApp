var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  next();
});
app.use(bodyParser.json());

const port = process.env.PORT || 2410;

const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "sampita123*",
  database: "postgres",
  port: 5432,
  host: "db.exsooxwehydzqqxtlknu.supabase.co",
  ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
  console.log(`connected!!!`);
});

app.post("/login", function (req, res) {
  let body = req.body;
  const query=`SELECT * FROM users`;
  client.query(query,function(err,result){
    if(err) res.status(400).send(err);
    else{
      let userArr=result.rows;
      let user=userArr.find((u)=>u.email===body.email && u.password===body.password);
      if(user) res.send(user);
      else res.status(404).send("Incorrect Email or Password");
    }
  })
});
app.post("/register", function (req, res) {
  let body = req.body;
  delete body.conPassword;
  let values=Object.values(body);
  const query=`INSERT INTO users (email,password) VALUES ($1,$2)`;
  client.query(query,values,function(err,result){
    if(err) res.status(400).send(err);
    else res.send(body);
  })
});

app.get("/products", function (req, res) {
  let category = req.query.category;
  const query = `SELECT * FROM prodtable`;
  client.query(query, function (err, result) {
    if (err) res.status(400).send(err);
    else {
      let prodArr = result.rows;
      if (category) prodArr = prodArr.filter((p) => p.category === category);
      res.send(prodArr);
    }
  });
});

app.get("/products/:id", function (req, res) {
  let id = +req.params.id;
  const query = `SELECT * FROM prodtable WHERE id=$1`;
  client.query(query, [id], function (err, result) {
    if (err) res.status(400).send(err);
    else res.send(result.rows);
  });
});

app.post("/products", function (req, res) {
  let body = req.body;
  let obj = { ...body };
  let values = Object.values(obj);
  const query = `INSERT INTO prodtable (category,description,imglink,name,price) VALUES ($1,$2,$3,$4,$5)`;
  client.query(query, values, function (err, result) {
    if (err) res.status(400).send(err);
    else res.send("Insertion Successfull");
  });
});

app.put("/products/:id", function (req, res) {
  let id = +req.params.id;
  let body = req.body;
  let value = Object.values(body);
  let values = [...value, id];
  console.log(values);
  const query = `UPDATE prodtable SET category=$1,description=$2,imglink=$3,name=$4,price=$5 WHERE id=$6`;
  client.query(query, values, function (err, result) {
    if (err) res.status(400).send(err);
    else res.send("updation successful");
  });
});

app.delete("/products/:id", function (req, res) {
  let id = +req.params.id;
  const query = `DELETE FROM prodtable WHERE id=$1`;
  client.query(query, [id], function (err, result) {
    if (err) res.status(404).send(err);
    else res.send("Data Deleted");
  });
});

app.get("/cart", function (req, res) {
  const query = `SELECT * FROM cart`;
  client.query(query, function (err, result) {
    if (err) res.status(400).send(err);
    else res.send(result.rows);
  });
});

app.post("/cart", function (req, res) {
  let body = req.body;
  let values = Object.values(body);
  const query = `INSERT INTO cart (id,category,description,imglink,name,price,quantity) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
  client.query(query, values, function (err, result) {
    if (err) res.status(400).send(err);
    else res.send(`${result.rowCount} insertion successful`);
  });
});

app.put("/cart/:id", function (req, res) {
  let id = +req.params.id;
  let quantity = +req.body.quantity;
  let values = [quantity, id];
  const query = `UPDATE cart SET quantity=$1 WHERE id=$2`;
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err);
    else res.send(`${result.rowCount} updation successful`);
  });
});
app.delete("/cart/:id", function (req, res) {
  let id = +req.params.id;
  const query = `DELETE FROM cart WHERE id=$1`;
  client.query(query, [id], function (err, result) {
    if (err) res.status(400).send(err);
    res.send(`${result.rowCount} deletion seccessful`);
  });
});
app.delete("/myCart", function (req, res) {
  const query = `DELETE FROM cart`;
  client.query(query, function (err, result) {
    if (err) res.status(404).send(err);
    else res.send(`whole row deleted`);
  });
});
app.get("/myOrders", function (req, res) {
  const query = `SELECT * FROM myorder`;
  client.query(query, function (err, result) {
    if (err) res.status(404).send(err);
    else res.send(result.rows);
  });
});
app.post("/myOrders", function (req, res) {
  let values = Object.values(req.body);
  let query = `INSERT INTO myorder (name,line1,line2,city,totqty,totamt) VALUES ($1,$2,$3,$4,$5,$6)`;
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err);
    else res.send(`${result.rowCount} insertion seccessful`);
  });
});
app.listen(port, () => console.log(`Listening on port ${port}!`));
