'user-strict';

exports.handler = function(countryId,stateId,cityId,foodId,restoId,change,database){
  //Define the variables
  const rankingFollowersRef = database.ref('rankings-followers');
  const timelineDBRef = database.ref('user-timeline');
  const restoDataDBRef = database.ref('resto');
  const foodTypeDBRef = database.ref('foodType');
  const geographyDBRef = database.ref('geography');

  const updateObject = {};
  // Get the position delta
  const newPosition = change.after.val();
  const oldPosition = change.before.val();

  // Only distribute if there were changes, and we don't inform leavers
  if(newPosition != oldPosition && newPosition != null){
    // 1. Get the array of follower Keys
    const rankingDBPath = countryId + '/' + stateId + '/' + cityId + '/' + foodId;
    return rankingFollowersRef.child(rankingDBPath).once('value', function(snapshot){
      if(snapshot.exists()){
        const userKeysAsArray = Object.keys(snapshot.val());

        // 2. Get the restaurant name
        const restoDBPath = countryId+'/'+stateId+'/'+cityId+'/'+restoId;
        return restoDataDBRef.child(restoDBPath).once('value', function(restoDataSnap){
          const restoName = restoDataSnap.child('name').val();

          // 3. Get the ranking icon + name
          return foodTypeDBRef.child(countryId+'/'+foodId).once('value', function(foodTypeWorldSnap){
            if(foodTypeWorldSnap.exists()){
              icon = foodTypeWorldSnap.child('icon').val();
              foodName = foodTypeWorldSnap.child('name').val();

              // 4. Get the city cityName
              let cityDBPath = countryId+'/'+stateId+'/'+cityId;
              return geographyDBRef.child(cityDBPath).once('value', function(citySnap){
                const cityName = citySnap.child('name').val();

                //The post to be distributed
                const timestamp = Date.now();
                const target = countryId+'/'+stateId+'/'+cityId+'/'+foodId;
                const targetName = cityName +'/'+ foodName +'/'+icon;
                var type;
                var postId;
                var payload;



                if(newPosition == 1){
                  postId = Math.floor(timestamp)+':bestinrank:'+cityId+':'+foodId;
                  type = 'newBestRestoInRanking';
                  payload = restoName+' is now the best '+ foodName+' place in '+cityName+'.';
                }else if (oldPosition == null || (oldPosition > newPosition)){
                  type = 'newArrivalInRanking';
                  postId = 'new-arrival-ranking:'+countryId+':'+stateId+':'+cityId+':'+foodId;
                  payload = restoName+' is now among the best '+ foodName+' places in '+cityName+'.';
                }else{
                  return null;
                }
                //Add the timelines to the Object
                userKeysAsArray.forEach( key => {
                  updateObject['user-timeline/'+key+'/'+postId+'/timestamp']=timestamp;
                  updateObject['user-timeline/'+key+'/'+postId+'/type']=type;
                  updateObject['user-timeline/'+key+'/'+postId+'/target']=target;
                  updateObject['user-timeline/'+key+'/'+postId+'/targetName']=targetName;
                  updateObject['user-timeline/'+key+'/'+postId+'/payload']=payload;
                });

                // The atomic commit
                return database.ref().update(updateObject);

              });
            }
          });
        });
      }
    });
  }
};
