"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = calculateAge;
exports.calculateProfileCompleteness = calculateProfileCompleteness;
exports.calculateAndStoreCompatibility = calculateAndStoreCompatibility;
exports.buildPublicProfile = buildPublicProfile;
exports.buildUserProfile = buildUserProfile;
exports.generateOtp = generateOtp;
var db_1 = require("@workspace/db");
var db_2 = require("@workspace/db");
var drizzle_orm_1 = require("drizzle-orm");
var db_3 = require("@workspace/db");
function calculateAge(dateOfBirth) {
    if (!dateOfBirth)
        return null;
    var dob = new Date(dateOfBirth);
    var today = new Date();
    var age = today.getFullYear() - dob.getFullYear();
    var m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
        age--;
    return age;
}
function calculateProfileCompleteness(user, photos) {
    var fields = [
        "firstName", "lastName", "dateOfBirth", "gender", "bio",
        "height", "weight", "maritalStatus",
        "occupation", "company", "education", "fieldOfStudy", "industry", "annualIncomeRange",
        "country", "stateRegion", "city", "citizenship", "languages", "religion",
        "dietaryPreference", "smoking", "drinking", "interests"
    ];
    var filled = fields.filter(function (f) { return user[f] != null && user[f] !== "" && (!Array.isArray(user[f]) || user[f].length > 0); }).length;
    var score = (filled / fields.length) * 100;
    return Math.min(100, Math.round(score));
}
function calculateAndStoreCompatibility(currentUserProfile, targetUserProfile, currentUserId, targetUserId) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, compatibilityScore, breakdown, sharedStrengths, potentialDifferences, summary, profileConfidence, isPreliminary, getPercentagesAndConfidence, currentUserData, targetUserData, currentUserPercs_1, targetUserPercs_1, calculateStrictSimilarity, connectionSimilarity, growthSimilarity, stabilitySimilarity, explorationSimilarity, familyValuesCompatibility, communicationStyleCompatibility, relationshipExpectationsCompatibility, lifestylePreferencesCompatibility, weightedScore, rawScore, penaltyApplied, band, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.db.query.compatibilityScoresTable.findFirst({
                        where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_2.compatibilityScoresTable.userAId, currentUserId), (0, drizzle_orm_1.eq)(db_2.compatibilityScoresTable.userBId, targetUserId)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_2.compatibilityScoresTable.userAId, targetUserId), (0, drizzle_orm_1.eq)(db_2.compatibilityScoresTable.userBId, currentUserId)))
                    })];
                case 1:
                    cached = _b.sent();
                    if (cached) {
                        return [2 /*return*/, {
                                compatibilityScore: cached.score,
                                breakdown: cached.breakdown ? JSON.parse(cached.breakdown) : [],
                                sharedStrengths: cached.sharedStrengths ? JSON.parse(cached.sharedStrengths) : [],
                                potentialDifferences: cached.potentialDifferences ? JSON.parse(cached.potentialDifferences) : [],
                                summary: cached.summary,
                                isPreliminary: cached.isPreliminary === 1,
                                profileConfidence: (_a = cached.profileConfidence) !== null && _a !== void 0 ? _a : 100
                            }];
                    }
                    compatibilityScore = ((currentUserId * 7 + targetUserId * 13) % 20) + 60;
                    breakdown = [];
                    sharedStrengths = [];
                    potentialDifferences = [];
                    summary = "You share some basic similarities.";
                    profileConfidence = 100;
                    isPreliminary = false;
                    if ((currentUserProfile === null || currentUserProfile === void 0 ? void 0 : currentUserProfile.traits) && (targetUserProfile === null || targetUserProfile === void 0 ? void 0 : targetUserProfile.traits)) {
                        getPercentagesAndConfidence = function (traitsStr) {
                            var _a, _b;
                            try {
                                var traits = JSON.parse(traitsStr);
                                var tScore = 0;
                                var primary = ["Connection", "Growth", "Stability", "Exploration"];
                                var _loop_1 = function (t) {
                                    if (primary.includes(t.trait))
                                        tScore += (t.score || 0);
                                    else if (primary.some(function (p) { return t.trait === "".concat(p, " Oriented"); }))
                                        tScore += (t.score || 0);
                                };
                                for (var _i = 0, traits_1 = traits; _i < traits_1.length; _i++) {
                                    var t = traits_1[_i];
                                    _loop_1(t);
                                }
                                var confidence = tScore > 0 ? Math.min(100, Math.round((tScore / 400) * 100)) : 0;
                                if (tScore === 0)
                                    return { percs: { Connection: 25, Growth: 25, Stability: 25, Exploration: 25 }, confidence: 0 };
                                var percs = {};
                                var _loop_2 = function (p) {
                                    var exact = ((_a = traits.find(function (t) { return t.trait === p; })) === null || _a === void 0 ? void 0 : _a.score) || 0;
                                    var old = ((_b = traits.find(function (t) { return t.trait === "".concat(p, " Oriented"); })) === null || _b === void 0 ? void 0 : _b.score) || 0;
                                    percs[p] = ((exact + old) / tScore) * 100;
                                };
                                for (var _c = 0, primary_1 = primary; _c < primary_1.length; _c++) {
                                    var p = primary_1[_c];
                                    _loop_2(p);
                                }
                                return { percs: percs, confidence: confidence };
                            }
                            catch (e) {
                                return { percs: { Connection: 25, Growth: 25, Stability: 25, Exploration: 25 }, confidence: 0 };
                            }
                        };
                        currentUserData = getPercentagesAndConfidence(currentUserProfile.traits);
                        targetUserData = getPercentagesAndConfidence(targetUserProfile.traits);
                        currentUserPercs_1 = currentUserData.percs;
                        targetUserPercs_1 = targetUserData.percs;
                        profileConfidence = Math.min(currentUserData.confidence, targetUserData.confidence);
                        if (profileConfidence < 30)
                            isPreliminary = true;
                        calculateStrictSimilarity = function (traitName) {
                            var diff = Math.abs((currentUserPercs_1[traitName] || 0) - (targetUserPercs_1[traitName] || 0));
                            return Math.max(0, 100 - diff);
                        };
                        connectionSimilarity = calculateStrictSimilarity("Connection");
                        growthSimilarity = calculateStrictSimilarity("Growth");
                        stabilitySimilarity = calculateStrictSimilarity("Stability");
                        explorationSimilarity = calculateStrictSimilarity("Exploration");
                        familyValuesCompatibility = Math.round(stabilitySimilarity);
                        communicationStyleCompatibility = Math.round(connectionSimilarity);
                        relationshipExpectationsCompatibility = Math.round((connectionSimilarity + stabilitySimilarity) / 2);
                        lifestylePreferencesCompatibility = Math.round((explorationSimilarity + stabilitySimilarity) / 2);
                        breakdown = [
                            { dimension: "Family Values", score: familyValuesCompatibility, description: "Shared views on family and stability." },
                            { dimension: "Communication Style", score: communicationStyleCompatibility, description: "How well your communication styles match." },
                            { dimension: "Relationship Expectations", score: relationshipExpectationsCompatibility, description: "Alignment in what you seek in a relationship." },
                            { dimension: "Lifestyle Preferences", score: lifestylePreferencesCompatibility, description: "Compatibility in daily routines and adventures." }
                        ];
                        weightedScore = (connectionSimilarity * 0.30) + (growthSimilarity * 0.20) + (stabilitySimilarity * 0.30) + (explorationSimilarity * 0.20);
                        rawScore = weightedScore;
                        penaltyApplied = 0;
                        if (Math.abs((currentUserPercs_1["Connection"] || 0) - (targetUserPercs_1["Connection"] || 0)) > 30)
                            penaltyApplied += 5;
                        if (Math.abs((currentUserPercs_1["Growth"] || 0) - (targetUserPercs_1["Growth"] || 0)) > 30)
                            penaltyApplied += 5;
                        if (Math.abs((currentUserPercs_1["Stability"] || 0) - (targetUserPercs_1["Stability"] || 0)) > 30)
                            penaltyApplied += 5;
                        if (Math.abs((currentUserPercs_1["Exploration"] || 0) - (targetUserPercs_1["Exploration"] || 0)) > 30)
                            penaltyApplied += 5;
                        weightedScore -= penaltyApplied;
                        compatibilityScore = Math.min(100, Math.max(0, Math.round(weightedScore)));
                        console.log("\n=== COMPATIBILITY DEBUG ===");
                        console.log("Current User ID: ".concat(currentUserId));
                        console.log("Target User ID: ".concat(targetUserId));
                        console.log("Connection Similarity:", connectionSimilarity);
                        console.log("Growth Similarity:", growthSimilarity);
                        console.log("Stability Similarity:", stabilitySimilarity);
                        console.log("Exploration Similarity:", explorationSimilarity);
                        console.log("Raw Compatibility Score:", rawScore);
                        console.log("Penalty Applied:", -penaltyApplied);
                        console.log("Final Compatibility Score:", compatibilityScore);
                        console.log("===========================\n");
                        if (familyValuesCompatibility >= 75)
                            sharedStrengths.push("✓ Similar family values");
                        else
                            potentialDifferences.push("⚠ Different family values");
                        if (relationshipExpectationsCompatibility >= 75)
                            sharedStrengths.push("✓ Compatible relationship expectations");
                        else
                            potentialDifferences.push("⚠ Differing relationship expectations");
                        if (growthSimilarity >= 75)
                            sharedStrengths.push("✓ Shared growth mindset");
                        else
                            potentialDifferences.push("⚠ Different growth priorities");
                        if (lifestylePreferencesCompatibility >= 75)
                            sharedStrengths.push("✓ Compatible lifestyle choices");
                        else
                            potentialDifferences.push("⚠ Different lifestyle preferences");
                        if (explorationSimilarity >= 75)
                            sharedStrengths.push("✓ Shared sense of exploration");
                        else if (Math.abs((currentUserPercs_1["Exploration"] || 0) - (targetUserPercs_1["Exploration"] || 0)) > 30) {
                            potentialDifferences.push("⚠ Major differences in exploration preferences");
                        }
                        else {
                            potentialDifferences.push("⚠ Different exploration preferences");
                        }
                        if (communicationStyleCompatibility >= 75)
                            sharedStrengths.push("✓ Strong communication synergy");
                        else
                            potentialDifferences.push("⚠ Different communication styles");
                        sharedStrengths = sharedStrengths.slice(0, 3);
                        potentialDifferences = potentialDifferences.slice(0, 2);
                        if (sharedStrengths.length === 0)
                            sharedStrengths.push("✓ Balanced overall traits");
                        if (potentialDifferences.length === 0)
                            potentialDifferences.push("✓ No major differences");
                        band = "Low Compatibility";
                        if (compatibilityScore >= 90)
                            band = "Exceptional Match";
                        else if (compatibilityScore >= 80)
                            band = "Strong Match";
                        else if (compatibilityScore >= 70)
                            band = "Good Match";
                        else if (compatibilityScore >= 60)
                            band = "Potential Match";
                        if (isPreliminary) {
                            summary = "Preliminary Match - More answers required.";
                        }
                        else {
                            summary = "You have a ".concat(band, " with a score of ").concat(compatibilityScore, "%.");
                        }
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db_1.db.insert(db_2.compatibilityScoresTable).values({
                            userAId: currentUserId,
                            userBId: targetUserId,
                            score: compatibilityScore,
                            breakdown: JSON.stringify(breakdown),
                            sharedStrengths: JSON.stringify(sharedStrengths),
                            potentialDifferences: JSON.stringify(potentialDifferences),
                            summary: summary,
                            isPreliminary: isPreliminary ? 1 : 0,
                            profileConfidence: profileConfidence
                        })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    console.error("Error inserting compatibility score cache", e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, {
                        compatibilityScore: compatibilityScore,
                        breakdown: breakdown,
                        sharedStrengths: sharedStrengths,
                        potentialDifferences: potentialDifferences,
                        summary: summary,
                        isPreliminary: isPreliminary,
                        profileConfidence: profileConfidence
                    }];
            }
        });
    });
}
function buildPublicProfile(userId, viewerUserId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, photos, isMutualMatch, hasPendingInterest, interestSentByViewer, pendingInterestId, interestsTable, interests, _i, interests_1, interest, isFullyVisible, compatibilityScore, viewerProfile, targetProfile, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.query.usersTable.findFirst({
                        where: (0, drizzle_orm_1.eq)(db_2.usersTable.id, userId),
                    })];
                case 1:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db_1.db.select().from(db_2.photosTable).where((0, drizzle_orm_1.eq)(db_2.photosTable.userId, userId))];
                case 2:
                    photos = _a.sent();
                    isMutualMatch = false;
                    hasPendingInterest = false;
                    interestSentByViewer = false;
                    pendingInterestId = null;
                    if (!(viewerUserId && viewerUserId !== userId)) return [3 /*break*/, 5];
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("@workspace/db")); })];
                case 3:
                    interestsTable = (_a.sent()).interestsTable;
                    return [4 /*yield*/, db_1.db.select().from(interestsTable).where((0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(interestsTable.fromUserId, viewerUserId), (0, drizzle_orm_1.eq)(interestsTable.toUserId, userId)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(interestsTable.fromUserId, userId), (0, drizzle_orm_1.eq)(interestsTable.toUserId, viewerUserId))))];
                case 4:
                    interests = _a.sent();
                    for (_i = 0, interests_1 = interests; _i < interests_1.length; _i++) {
                        interest = interests_1[_i];
                        if (interest.status === "accepted")
                            isMutualMatch = true;
                        if (interest.status === "pending") {
                            hasPendingInterest = true;
                            pendingInterestId = interest.id;
                            if (interest.fromUserId === viewerUserId)
                                interestSentByViewer = true;
                        }
                    }
                    _a.label = 5;
                case 5:
                    isFullyVisible = isMutualMatch || viewerUserId === userId;
                    compatibilityScore = null;
                    if (!(viewerUserId && viewerUserId !== userId)) return [3 /*break*/, 9];
                    return [4 /*yield*/, db_1.db.query.personalityProfilesTable.findFirst({ where: (0, drizzle_orm_1.eq)(db_3.personalityProfilesTable.userId, viewerUserId) })];
                case 6:
                    viewerProfile = _a.sent();
                    return [4 /*yield*/, db_1.db.query.personalityProfilesTable.findFirst({ where: (0, drizzle_orm_1.eq)(db_3.personalityProfilesTable.userId, userId) })];
                case 7:
                    targetProfile = _a.sent();
                    return [4 /*yield*/, calculateAndStoreCompatibility(viewerProfile, targetProfile, viewerUserId, userId)];
                case 8:
                    result = _a.sent();
                    compatibilityScore = result.compatibilityScore;
                    _a.label = 9;
                case 9: return [2 /*return*/, {
                        id: user.id,
                        firstName: user.firstName,
                        displayName: user.displayName,
                        age: calculateAge(user.dateOfBirth),
                        occupation: isFullyVisible ? user.occupation : null,
                        education: isFullyVisible ? user.education : null,
                        city: user.city,
                        country: user.country,
                        religion: isFullyVisible ? user.religion : null,
                        bio: isFullyVisible ? user.bio : "This user's bio is hidden. Connect to see their full profile!",
                        photos: isFullyVisible
                            ? photos.map(function (p) { return ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId }); })
                            : photos.slice(0, 1).map(function (p) { return ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId }); }),
                        verificationStatus: user.verificationStatus,
                        isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin",
                        compatibilityScore: compatibilityScore,
                        journeyProgress: user.journeyProgress,
                        isMutualMatch: isMutualMatch,
                        hasPendingInterest: hasPendingInterest,
                        interestSentByViewer: interestSentByViewer,
                        pendingInterestId: pendingInterestId,
                    }];
            }
        });
    });
}
function buildUserProfile(user) {
    return __awaiter(this, void 0, void 0, function () {
        var photos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(db_2.photosTable).where((0, drizzle_orm_1.eq)(db_2.photosTable.userId, user.id))];
                case 1:
                    photos = _a.sent();
                    return [2 /*return*/, {
                            id: user.id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            displayName: user.displayName,
                            dateOfBirth: user.dateOfBirth,
                            age: calculateAge(user.dateOfBirth),
                            gender: user.gender,
                            phone: user.phone,
                            bio: user.bio,
                            occupation: user.occupation,
                            education: user.education,
                            religion: user.religion,
                            motherTongue: user.motherTongue,
                            city: user.city,
                            country: user.country,
                            height: user.height,
                            maritalStatus: user.maritalStatus,
                            dietaryPreference: user.dietaryPreference,
                            smoking: user.smoking,
                            drinking: user.drinking,
                            photos: photos.map(function (p) { return ({ id: p.id, url: p.url, isPrimary: p.isPrimary, publicId: p.publicId }); }),
                            role: user.role,
                            verificationStatus: user.verificationStatus,
                            isPhoneVerified: user.isPhoneVerified,
                            isEmailVerified: user.isEmailVerified,
                            journeyProgress: user.journeyProgress,
                            isPremium: user.role === "premium" || user.role === "admin" || user.role === "superadmin",
                            profileCompleteness: calculateProfileCompleteness(user, photos),
                            createdAt: user.createdAt.toISOString(),
                        }];
            }
        });
    });
}
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
