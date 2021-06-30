"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = __importDefault(require("cors"));
var detectlanguage_1 = __importDefault(require("detectlanguage"));
var express_1 = __importDefault(require("express"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var mongoose_1 = __importDefault(require("mongoose"));
var MONGODB = process.env.MONGODB || "mongodb://localhost:27017/letsendorse";
var JWTSECRET = process.env.JWTSECRET || "qweqow39n32093";
var PORT = process.env.PORT || 8080;
var DETECT_LANG = process.env.DETECT_LANG || "";
var dl = new detectlanguage_1.default(DETECT_LANG);
mongoose_1.default.connect(MONGODB, {
    useCreateIndex: true,
});
var usersSchema = new mongoose_1.default.Schema({
    name: String,
    mobileNumber: String,
});
var userModel = mongoose_1.default.model("users", usersSchema);
var app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
app.get("/validate", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var authorization, token, validate;
    return __generator(this, function (_a) {
        authorization = req.headers["authorization"] || req.headers["Authorization"];
        token = authorization.split(" ")[1];
        try {
            validate = jsonwebtoken_1.default.verify(token, JWTSECRET);
            res.status(200).json(validate);
        }
        catch (err) {
            res.status(400).json({ success: false });
        }
        return [2 /*return*/];
    });
}); });
app.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobileNumber, name, result, r, token, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log(req.body);
                _a = req.body, mobileNumber = _a.mobileNumber, name = _a.name;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, userModel.findOne({ mobileNumber: mobileNumber })];
            case 2:
                result = _b.sent();
                return [4 /*yield*/, userModel.findByIdAndUpdate(result._id, {
                        mobileNumber: mobileNumber,
                        name: name,
                    })];
            case 3:
                r = _b.sent();
                if (r) {
                    token = jsonwebtoken_1.default.sign({ name: name, mobileNumber: mobileNumber, id: result._id }, JWTSECRET);
                    res.json({ id: result._id, name: name, mobileNumber: mobileNumber, token: token });
                }
                else {
                    throw new Error("couldnt update");
                }
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                res.status(400).json({ success: false });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post("/register", function (req, res) {
    var mobileNumber = req.body.mobileNumber;
    userModel
        .create({ mobileNumber: mobileNumber })
        .then(function (result) {
        res.status(200).json({ result: result });
    })
        .catch(function (err) {
        console.log(err);
        res.status(400).json({ success: false });
    });
});
app.post("/detect_language", function (req, res) {
    var authorization = req.headers["authorization"] || req.headers["Authorization"];
    var token = authorization.split(" ")[1];
    try {
        var validate = jsonwebtoken_1.default.verify(token, JWTSECRET);
        if (validate) {
            dl.detect(req.body.text)
                .then(function (languages) {
                res.status(200).json(languages);
            })
                .catch(function (err) {
                throw err;
            });
        }
        else {
            throw new Error("");
        }
    }
    catch (err) {
        res.status(400).json({ success: false });
    }
});
app.listen(PORT, function () {
    console.log("http://localhost:8080");
});
