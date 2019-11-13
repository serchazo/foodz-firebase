// Index file

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
'use-strict';

// General init lines
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Then
const database = admin.database();


//My imports
const helloWorldTest = require('./helloWorldTest');
const user_following_nb = require('./user_following_nb');
const user_followers_nb = require('./user_followers_nb');
const timeline_Ranking_NewBest = require('./timeline_Ranking_NewBest');
const timeline_User_Following = require('./timeline_User_Following');
const timeline_User_NewFavorite = require('./timeline_User_NewFavorite');
const timeline_User_Review_After_Moderation = require('./timeline_User_Review_After_Moderation');

const review_moderation_distribution = require('./review_moderation_distribution');
const review_resto_nb = require('./review_resto_nb');
const review_likeNb_update = require('./review_likeNb_update');
const review_likeNb_update_resto = require('./review_likeNb_update_resto');
const review_reported = require('./review_reported');

const user_updatepoints_fromposition = require('./user_updatepoints_fromposition');
const user_multiplier_update = require('./user_multiplier_update');
const user_updatepoints_aftermultiplier = require('./user_updatepoints_aftermultiplier');
const resto_updatepoints_afteruserupdate = require('./resto_updatepoints_afteruserupdate');
const updateRankings = require('./updateRankings');

const delete_User_easy = require('./delete_User_easy');
const delete_User_following_rankings = require('./delete_User_following_rankings');
const delete_User_following = require('./delete_User_following');
const delete_User_reviews = require('./delete_User_reviews');

const delete_resto_from_ranking = require('./delete_resto_from_ranking');

/****
Users: follow and unfollow
*****/
exports.user_following_nb = functions.database.ref('/user-following/{userId}/{followingId}')
.onWrite(async (change, context) => {
  const userId = context.params.userId;
  const followingId = context.params.followingId;

  user_following_nb.handler(userId,followingId,change,database)
  .then(_ =>{
    console.log('Updated following nb for '+userId +' aftter follow: '+followingId);
  }).catch(err =>{
    console.error('there was an error updating following nb for '+userId +' aftter follow: '+followingId);
  });
});

exports.user_followers_nb = functions.database.ref('/user-followers/{targetId}/{userId}')
.onWrite(async (change, context) => {
  const userId = context.params.userId;
  const targetId = context.params.targetId;

  user_followers_nb.handler(userId,targetId,change,database)
  .then(_ =>{
    console.log('Updated followers nb for '+targetId +' aftter follow: '+userId);
  }).catch(err =>{
    console.error('there was an error updating followers nb for '+targetId +' aftter follow: '+userId);
  });
});

/**************
Points stuff
***************/
exports.user_updatepoints_fromposition = functions.database
.ref('user-ranking-detail/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}/position')
.onWrite(async (change,context) => {
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  user_updatepoints_fromposition
  .handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
  .then(_ =>{
    console.log('Updated points for '+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
  }).catch(err =>{
    console.error('there was an error');
  });
});

// Re-calculate the points multiplier from the nb of followers
exports.user_multiplier_update = functions.database
.ref('user-followers-nb/{userId}').onWrite(async (change,context) =>{
  const userId = context.params.userId;
  user_multiplier_update.handler(userId,change,database).then(_ =>{
    console.log('multiplier updated for '+ userId);
  }).catch(err =>{
    console.error('there was an error');
  });
});

// Recalculate the points after a multiplier update
exports.user_updatepoints_aftermultiplier = functions.database.ref('user-pointsmultiplier/{userId}')
.onWrite(async (change,context) =>{
  const userId = context.params.userId;

  user_updatepoints_aftermultiplier.handler(userId,change,database).then(_ =>{
    console.log('Points updated for '+ userId);
  }).catch(err =>{
    console.error('there was an error updating points for '+ userId);
  });
});

// Recalculate resto points
exports.resto_updatepoints_afteruserupdate = functions.database
.ref('user-ranking-points/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}/points')
.onWrite(async (change,context) =>{
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  resto_updatepoints_afteruserupdate
  .handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
  .then(_ =>{
    console.log('Points updated for '+ userId);
  }).catch(err =>{
    console.error('there was an error updating points for '+ userId);
  });
});

/*************
Receive update request from Scheduler
**************/
exports.updateRankings = functions.https.onRequest((req,res) => {
  updateRankings.handler(req,res, database).then(_ =>{
    console.log('Ranks updated at '+ Date.now());
  }).catch(err =>{
    console.error('There was an error updating Rankings.');
  });
});

/**************
Review moderation and distribution
Snipet from google firebase
**************/
exports.review_moderation_distribution = functions.database
.ref('user-reviews/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}')
.onWrite((change,context) => {
  const message = change.after.val();

  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  // If the message is not sanitized then go
  if (message && !message.sanitized){
    review_moderation_distribution.handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
    .then(_ =>{
      console.log('Message moderated:'+userId+':'+restoId);
    }).catch(err => {
      console.erro('There was an error');
    });
  }
  return null;
});

// Update the number of reviews
exports.review_resto_nb = functions.database
.ref('user-reviews/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}')
.onWrite((change,context) => {
  const message = change.after.val();

  // Once sanitized, update
  if (message && message.sanitized){
    const restoName = message.restoname;
    const userId = context.params.userId;
    const countryId = context.params.countryId;
    const stateId = context.params.stateId;
    const cityId = context.params.cityId;
    const foodId = context.params.foodId;
    const restoId = context.params.restoId;


    review_resto_nb.handler(userId,countryId,stateId,cityId,foodId,restoId,restoName,message,database)
    .then(_ =>{
      console.log('Review count updated:'+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
    }).catch(err => {
      console.erro('There was an error updating review count');
    });
  }
  return null;

});


/************
Report review
*************/
exports.review_reported = functions.database
.ref('user-reported-reviews/{reporterId}/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}')
.onCreate(async (change, context) => {
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  review_reported.handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
  .then(_ =>{
    console.log('Review reported:'+userId+':'+restoId);
  }).catch(err => {
    console.erro('There was an error');
  });
});

/*******
Delete resto from ranking: clean up
********/
exports.delete_resto_from_ranking = functions.database.ref('user-ranking-detail/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}')
.onDelete(async (snapshot, context) => {
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  delete_resto_from_ranking.handler(userId,countryId,stateId,cityId,foodId,restoId,database)
  .then(_ =>{
    console.log('Deleted resto from ranking: '+userId + ':'+restoId);
  }).catch(err =>{
    console.error('there was an error deleting resto from ranking'+userId + ':'+restoId);
  });
});
/*******
Delete user
********/
exports.delete_User_login = functions.database.ref('user-data/{userId}')
.onDelete(async (snapshot, context) => {
  const userId = context.params.userId;
  admin.auth().deleteUser(userId)
  .then(function() {
    console.log('Successfully deleted user: ' + userId);
  })
  .catch(function(error) {
    console.log('Error deleting user ' + userId +': ', error);
  });
});


exports.delete_User_easy = functions.database.ref('user-data/{userId}')
.onDelete(async (snapshot, context) => {
  const userId = context.params.userId;
  delete_User_easy.handler(userId,database)
  .then(_ =>{
    console.log('Deleted user, easy part: '+userId);
  }).catch(err =>{
    console.error('there was an error');
  });
});

exports.delete_User_following_rankings = functions.database.ref('user-data/{userId}')
.onDelete(async (snapshot, context) => {
  const userId = context.params.userId;

  delete_User_following_rankings.handler(userId,database).then(_ =>{
    console.log('Deleted user rankings following :'+ userId);
  }).catch(err => {
    console.error('there was an error');
  });
});

exports.delete_User_following = functions.database.ref('user-data/{userId}')
.onDelete(async (snapshot, context) => {
  const userId = context.params.userId;
  delete_User_following.handler(userId,database)
  .then(_ =>{
    console.log ('Deleted user, rankings following : '+userId);
  }).catch(err =>{
    console.error('there was an error');
  });
});

exports.delete_User_reviews = functions.database.ref('user-data/{userId}')
.onDelete(async (snapshot, context) => {
  const userId = context.params.userId;
  delete_User_reviews.handler(userId,database)
  .then(_ =>{
    console.log ('Deleted user, rankings following : '+userId);
  }).catch(err =>{
    console.error('there was an error');
  });
});

/***********************
Count likes and dislikes
***********************/
exports.review_likeNb_update = functions.database.ref('user-reviews-likes/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}/{likerId}')
.onWrite(async (change,context) =>{
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

review_likeNb_update.handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
    .then(_ =>{
      console.log('Updated likes for: '+userId+':'+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
    }).catch(err =>{
      console.error('There was an error updating likes for: '+userId+':'+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
    });
});


// Same on resto side
exports.review_likeNb_update_resto = functions.database.ref('user-reviews-likes/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}/{likerId}')
.onWrite(async (change,context) =>{
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

review_likeNb_update_resto.handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
    .then(_ =>{
      console.log('Updated likes for: '+userId+':'+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
    }).catch(err =>{
      console.error('There was an error updating likes for: '+userId+':'+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
    });
});

/**************
Timeline funcs
**************/

// Timeline (and notification): You have a new follower
exports.timeline_User_Following = functions.database.ref('user-following/{userId}/{followingId}')
.onCreate(async (change, context) => {
  const userId = context.params.userId;
  const followingId = context.params.followingId;
  timeline_User_Following.handler(userId, followingId, change, database).then(_=>{
    console.log (userId+': is now following :'+followingId);
  }).catch(err => {
    console.error('there was an error');
  });
});

// Timeline: A user has created a new ranking
/*
exports.timeline_User_NewRanking = functions.database
.ref('user-rankings/{userId}/{countryId}/{stateId}/{cityId}/{foodId}')
.onCreate(async (change,context) =>{
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  timeline_User_NewRanking.handler(userId,countryId, stateId,cityId,foodId,change,database).then(_=>{
    console.log (userId+': added a ranking: Best '+foodId + ' in ' + cityId);
  }).catch(err => {
    console.error('there was an error');
  });
});*/

// Timeline : a top-ranking was updated
exports.timeline_Ranking_NewBest = functions.database
.ref('ranking-top/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}/position')
.onWrite(async (change,context) => {
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  timeline_Ranking_NewBest.handler(countryId,stateId,cityId,foodId,restoId,change,database).then(_=>{
    console.log ('Changes among the top distributed :'+countryId+':'+stateId+':'+'/'+cityId+'/'+foodId);
  }).catch(err => {
    console.error('there was an error');
  });

});

//Timeline : A user has a new number 1 for a ranking
exports.timeline_User_NewFavorite = functions.database
.ref('user-ranking-detail/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}/position')
.onWrite(async (change,context) =>{
  const userId = context.params.userId;
  const countryId = context.params.countryId;
  const stateId = context.params.stateId;
  const cityId = context.params.cityId;
  const foodId = context.params.foodId;
  const restoId = context.params.restoId;

  // Get the position
  const newPosition = change.after.val();

  if(newPosition == 1){
    timeline_User_NewFavorite
    .handler(userId,countryId,stateId,cityId,foodId,restoId,change,database)
    .then(_ =>{
      console.log('Usuer has a new favorite: '+countryId+':'+stateId+':'+cityId+':'+foodId+':'+restoId);
    }).catch(err =>{
      console.error('There was an error distributing to timeline.');
    });
  }
  return null;
});

// Timeline: a new sanitized message
exports.timeline_User_Review_After_Moderation = functions.database
.ref('user-reviews/{userId}/{countryId}/{stateId}/{cityId}/{foodId}/{restoId}')
.onWrite((change,context) => {
  const message = change.after.val();

  if (message && message.sanitized){
    // If there is a message, we define the variables
    const restoName = message.restoname;
    const userId = context.params.userId;
    const countryId = context.params.countryId;
    const stateId = context.params.stateId;
    const cityId = context.params.cityId;
    const foodId = context.params.foodId;
    const restoId = context.params.restoId;

    // Once sanitized, distribute to timelines
    timeline_User_Review_After_Moderation.handler(userId,countryId,stateId,cityId,foodId,restoId,restoName,message,database)
    .then(_ =>{
      console.log('New Review distributed to timelines:'+userId+':'+restoId);
    }).catch(err => {
      console.erro('There was an error');
    });
  }
  return null;

});

exports.helloWorldTest = functions.https.onRequest((req,res) => {
  helloWorldTest.handler(req,res);
});
