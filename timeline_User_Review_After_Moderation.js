'use-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,restoName,message,database) {
  // Define the variables first
  const followersDBRef = database.ref('user-followers');
  const timelineDBRef = database.ref('user-timeline');
  const restoReviewDBRef = database.ref('resto-reviews');
  const userDataDBRef = database.ref('user-data');
  const foodTypeDBRef = database.ref('foodType');
  const geographyDBRef = database.ref('geography');

  // 1. Get the array of follower Keys
  return followersDBRef.child(userId).once('value', function(snapshot){
    // [START] Verify if the user has any followers
    if (snapshot.exists()){
      const userKeysAsArray = Object.keys(snapshot.val());
      const updateObject = {};
      // 2. Get the user name
      return userDataDBRef.child(userId).once('value', function(userDataSnap){
        const userName = userDataSnap.child('nickname').val();
        // 3. Get food details
        return foodTypeDBRef.child(countryId).child(foodId).once('value', function(foodSnap){
          const foodName = foodSnap.child('name').val();
          const foodIcon = foodSnap.child('icon').val();

          // 4. Get the city cityName
          let cityDBPath = countryId+'/'+stateId+'/'+cityId;
          return geographyDBRef.child(cityDBPath).once('value', function(citySnap){
            const cityName = citySnap.child('name').val();

            //The post to be distributed
            const timestamp = message.timestamp;
            const postId = Math.floor(timestamp)+':review:'+userId+':'+restoId;
            const type = 'newUserReview';
            const initiator = userId;
            const target = countryId+'/'+stateId+'/'+cityId + '/' + foodId + '/' + restoId;
            const targetName = userName + '/' + cityName +'/'+ foodName +'/'+foodIcon+ '/' +restoName;
            const payload = userName+' added a new review of '+ restoName+'.';

            //Add the timelines to the Object
            userKeysAsArray.forEach( key => {
              updateObject['user-timeline/'+key+'/'+postId+'/timestamp']=timestamp;
              updateObject['user-timeline/'+key+'/'+postId+'/type']=type;
              updateObject['user-timeline/'+key+'/'+postId+'/initiator']=initiator;
              updateObject['user-timeline/'+key+'/'+postId+'/target']=target;
              updateObject['user-timeline/'+key+'/'+postId+'/targetName']=targetName;
              updateObject['user-timeline/'+key+'/'+postId+'/payload']=payload;
            });

            // Add to resto
            dbPath = 'resto-reviews/'+ countryId+'/' + stateId+'/' + cityId + '/' + foodId +'/'+ restoId+'/' + userId;
            updateObject[dbPath+'/timestamp']= timestamp;
            updateObject[dbPath+'/username']= userName;
            updateObject[dbPath+'/text']= message.text;

            // Add to control variable
            const userReviewList = 'user-reviews-list/'+userId+'/'+countryId+'/'+ stateId +'/'+cityId +'/' + foodId + '/' + restoId;
            updateObject[userReviewList] = true;

            // The atomic commit
            return database.ref().update(updateObject);
          });
        });
      });
    } // [END] If there are followers
  // If the user doesn't have any followers
  console.log('No followers for ' +userId);
  return null;
  });
};
