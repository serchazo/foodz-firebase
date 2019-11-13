'user-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,change,database){
  // Define the variables first
  const followersDBRef = database.ref('user-followers');
  const timelineDBRef = database.ref('user-timeline');
  const activityDBRef = database.ref('user-activity');
  const userDataDBRef = database.ref('user-data');
  const restoDataDBRef = database.ref('resto');
  const userRankingsDBRef = database.ref('user-rankings');
  const geographyDBRef = database.ref('geography');
  // Get the position
  const newPosition = change.after.val();

  if(newPosition == 1){
    // 1. Get the array of follower Keys
    return followersDBRef.child(userId).once('value', function(snapshot){

      // [START] Verify if the user has any followers
      if (snapshot.exists()){

        const userKeysAsArray = Object.keys(snapshot.val());
        const updateObject = {};

        // 2. Get the user name
        return userDataDBRef.child(userId).once('value', function(userDataSnap){
          const userName = userDataSnap.child('nickname').val();

          // 3. Get the restaurant name
          const restoDBPath = countryId+'/'+stateId+'/'+cityId+'/'+restoId;
          return restoDataDBRef.child(restoDBPath).once('value', function(restoDataSnap){
            const restoName = restoDataSnap.child('name').val();

            // 4. Get the food details
            let rankingDBPath = userId +'/'+countryId+'/'+stateId+'/'+cityId+'/'+foodId;
            return userRankingsDBRef.child(rankingDBPath).once('value', function(foodTypeSnap){
              const foodName = foodTypeSnap.child('name').val();
              const foodIcon = foodTypeSnap.child('icon').val();

              // 5. Get the city cityName
              let cityDBPath = countryId+'/'+stateId+'/'+cityId;
              return geographyDBRef.child(cityDBPath).once('value', function(citySnap){
                const cityName = citySnap.child('name').val();

                //The post to be distributed
                const timestamp = Date.now();
                const postId = Math.floor(timestamp)+':favorite:'+userId+':'+restoId;
                const type = 'newUserFavorite';
                const initiator = userId;
                const target = countryId+'/'+stateId+'/'+cityId+'/'+foodId+'/'+restoId;
                const targetName = userName + '/' + cityName +'/'+ foodName +'/'+foodIcon+ '/' +restoName;
                const payload = userName+' has a new favorite '+ foodName+' place in '+cityName+' : '+restoName;

                //Add the timelines to the Object
                userKeysAsArray.forEach( key => {
                  updateObject['user-timeline/'+key+'/'+postId+'/timestamp']=timestamp;
                  updateObject['user-timeline/'+key+'/'+postId+'/type']=type;
                  updateObject['user-timeline/'+key+'/'+postId+'/initiator']=initiator;
                  updateObject['user-timeline/'+key+'/'+postId+'/target']=target;
                  updateObject['user-timeline/'+key+'/'+postId+'/targetName']=targetName;
                  updateObject['user-timeline/'+key+'/'+postId+'/payload']=payload;
                });

                // The atomic commit
                return database.ref().update(updateObject);
              });
            });
          });
        });
      } // [END] If there are followers
      // If the user doesn't have any followers
      console.log('No followers for ' +userId);
      return null;
    });
  }
};
