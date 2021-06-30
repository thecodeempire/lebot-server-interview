import cors from "cors";
import detectLanguage from "detectlanguage";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const MONGODB = process.env.MONGODB || "mongodb://localhost:27017/letsendorse";
const JWTSECRET = process.env.JWTSECRET || "qweqow39n32093";
const PORT = process.env.PORT || 8080;
const DETECT_LANG = process.env.DETECT_LANG || "";

const dl = new detectLanguage(DETECT_LANG);

mongoose.connect(MONGODB, {
  useCreateIndex: true,
});

export interface IMessageSchema {
  _id: string;
  name: string;
  mobileNumber: string;
}
const usersSchema = new mongoose.Schema<IMessageSchema>({
  name: String,
  mobileNumber: String,
});
const userModel = mongoose.model("users", usersSchema);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/validate", async (req: any, res: any) => {
  const authorization =
    req.headers["authorization"] || req.headers["Authorization"];
  const token = authorization.split(" ")[1];
  try {
    const validate = jwt.verify(token, JWTSECRET!);
    res.status(200).json(validate);
  } catch (err) {
    res.status(400).json({ success: false });
  }
});

app.post("/login", async (req: any, res: any) => {
  console.log(req.body);
  const { mobileNumber, name } = req.body;
  try {
    const result = await userModel.findOne({ mobileNumber });
    const r = await userModel.findByIdAndUpdate(result._id, {
      mobileNumber,
      name,
    });
    if (r) {
      const token = jwt.sign(
        { name, mobileNumber, id: result._id },
        JWTSECRET!
      );
      res.json({ id: result._id, name, mobileNumber, token });
    } else {
      throw new Error("couldnt update");
    }
  } catch (err) {
    res.status(400).json({ success: false });
  }
});

app.post("/register", (req: any, res: any) => {
  const { mobileNumber } = req.body;
  userModel
    .create({ mobileNumber })
    .then((result: any) => {
      res.status(200).json({ result });
    })
    .catch((err: any) => {
      console.log(err);
      res.status(400).json({ success: false });
    });
});

app.post("/detect_language", (req: any, res: any) => {
  const authorization =
    req.headers["authorization"] || req.headers["Authorization"];
  const token = authorization.split(" ")[1];
  try {
    const validate = jwt.verify(token, JWTSECRET!);
    if (validate) {
      dl.detect(req.body.text)
        .then((languages) => {
          res.status(200).json(languages);
        })
        .catch((err) => {
          throw err;
        });
    } else {
      throw new Error("");
    }
  } catch (err) {
    res.status(400).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log("http://localhost:8080");
});
