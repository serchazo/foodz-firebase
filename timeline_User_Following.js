'use-strict';

exports.handler = function(userId, followingId, change, database) {
  // Define the variables first
  const followersDBRef = database.ref('user-followers');
  const timelineDBRef = database.ref('user-timeline');
  const activityDBRef = database.ref('user-activity');
  const userDataDBRef = database.ref('user-data');

  // 1. Get the array of follower Keys
  return followersDBRef.child(userId).once('value', function(snapshot){
    // [START] Verify if the user has any followers
    if (snapshot.exists()){


      const updateObject = {};
      // 2. Get the follower name
      return userDataDBRef.child(userId).once('value', function(userDataSnap){
        const userName = userDataSnap.child('nickname').val();
        // 3. Get the following defaults
        return userDataDBRef.child(followingId).once('value', function(followingDataSnap){
          const followingName = followingDataSnap.child('nickname').val();
          const defaultCity = followingDataSnap.child('default').val();

          //The post to be distributed
          const timestamp = Date.now();
          const postId = Math.floor(timestamp)+':follow:'+userId+':'+followingId;
          const type = 'newUserFollowing';
          const initiator = userId;
          const target = defaultCity+'/'+followingId;
          const targetName = followingName;
          const payload = userName+' is now following: '+ followingName+'.';

          // Verify if the user has any followers, and add to updateObject
          if (snapshot.exists()){
            const userKeysAsArray = Object.keys(snapshot.val());
            //Add the timelines to the Object
            userKeysAsArray.forEach( key => {
              updateObject['user-timeline/'+key+'/'+postId+'/timestamp']=timestamp;
              updateObject['user-timeline/'+key+'/'+postId+'/type']=type;
              updateObject['user-timeline/'+key+'/'+postId+'/initiator']=initiator;
              updateObject['user-timeline/'+key+'/'+postId+'/target']=target;
              updateObject['user-timeline/'+key+'/'+postId+'/targetName']=targetName;
              updateObject['user-timeline/'+key+'/'+postId+'/payload']=payload;
            });
          }

          // Add to my target timeline, whether followers or not
          const followingPayload = userName+' is now following you.';

          updateObject['user-timeline/'+followingId+'/'+postId+'/timestamp']=timestamp;
          updateObject['user-timeline/'+followingId+'/'+postId+'/type']=type;
          updateObject['user-timeline/'+followingId+'/'+postId+'/initiator']=initiator;
          updateObject['user-timeline/'+followingId+'/'+postId+'/target']=target;
          updateObject['user-timeline/'+followingId+'/'+postId+'/targetName']=targetName;
          updateObject['user-timeline/'+followingId+'/'+postId+'/payload']=followingPayload;

          // The atomic commit
          return database.ref().update(updateObject);
        });
      });
    } // [END] If there are followers
    // If the user doesn't have any followers
    console.log('No followers for ' +userId);
    return null;
  });
};
