var chai = require("chai");
var chaiHttp = require("chai-http");
var fs = require("fs");

chai.use(chaiHttp);
var should = chai.should();

var app;

describe("When not removing files shared before", () => {
  before(function (done) {
    fs.rmdirSync("dummy/uploads", { recursive: true });
    require("../index")
      .init({
        destination: "dummy/uploads",
        restart: false,
      })
      .then((generatedApp) => {
        app = generatedApp;
        done();
      });
  });

  it("it should return have the files uploaded in previous session", (done) => {
    chai
      .request(app)
      .get("/download/list")
      .end((err, res) => {
        res.body.should.be.an("array");
        res.body.length.should.equal(1);
        res.body[0].should.have.property("name", "dummy-up.txt");
        res.body[0].should.have.property("isFolder", false);
        res.body[0].should.have.property(
          "size",
          fs.statSync("dummy/dummy-up.txt").size
        );
        res.body[0].should.have.property("index", 0);
        done();
      });
  });
});
