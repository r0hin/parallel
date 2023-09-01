const functions = require('firebase-functions')
const admin = require("firebase-admin");
admin.initializeApp();

admin.storage().bucket('parallel-archive.appspot.com');
functions.storage.bucket('parallel-archive.appspot.com');

const buckets = require('./groups/buckets');
const misc = require('./groups/misc');
const reports = require('./groups/reports');
const guilds = require('./groups/guilds');
const friends = require('./groups/friends');

exports.manageUploads = buckets.manageUploads;
exports.manageDeletions = buckets.manageDeletions;
exports.manageLibraryKeywords = buckets.manageLibraryKeywords;
exports.resizeImages = buckets.resizeImages

exports.payments = misc.payments;
exports.startPayment = misc.startPayment;
exports.customerPortal = misc.customerPortal;
exports.getArtistProfilePhoto = misc.getArtistProfilePhoto;
exports.addReviewToPlaylist = misc.addReviewToPlaylist
exports.editReview = misc.editReview
exports.deleteReview = misc.deleteReview
exports.addReviewToAlbum = misc.addReviewToAlbum
exports.editAlbumReview = misc.editAlbumReview
exports.deleteAlbumReview = misc.deleteAlbumReview

exports.createAccount = misc.createAccount;
exports.updateTrackURL = misc.updateTrackURL;
exports.getLinkPreview = misc.getLinkPreview;
exports.searchParallelLibrary = misc.searchParallelLibrary;
exports.routeDeezer = misc.routeDeezer;
exports.deleteUser = misc.deleteUser;

exports.reportGroup = reports.reportGroup;
exports.reportLounge = reports.reportLounge;
exports.reportUser = reports.reportUser;
exports.reportTrack = reports.reportTrack;
exports.reportMissingTrack = reports.reportMissingTrack;
exports.banUser = reports.banUser;
exports.unbanUser = reports.unbanUser;

exports.joinGuild = guilds.joinGuild;
exports.leaveGuild = guilds.leaveGuild;
exports.deleteGuild = guilds.deleteGuild;
exports.requestJoinGuild = guilds.requestJoinGuild;
exports.cancelRequestJoinGuild = guilds.cancelRequestJoinGuild;
exports.acceptGuildRequest = guilds.acceptGuildRequest;
exports.rejectGuildRequest = guilds.rejectGuildRequest;
exports.deleteLounge = guilds.deleteLounge

exports.addFriendRequest = friends.addFriendRequest;
exports.removeFriend = friends.removeFriend;
exports.cancelRequest = friends.cancelRequest;
exports.acceptRequest = friends.acceptRequest;
exports.rejectRequest = friends.rejectRequest