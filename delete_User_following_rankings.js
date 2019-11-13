'user-strict';

exports.handler = function(userId,database){
  const userFollowingRankingsDBRef = database.ref('user-following-rankings'); // more complicated
  const rankingsFollowersDBRef = database.ref('rankings-followers');

  const updateObject = {};
  updateObject['user-following-rankings/'+userId]=null;
  // 1. Get the rankings that this user is following
  return userFollowingRankingsDBRef.child(userId).once('value', function(snapshot){
    // [START] Verify if the user is following rankings
    if(snapshot.exists()){
      // Country level
      snapshot.forEach(function(childSnapshot) {
        const countryKey = childSnapshot.key;
        // Go to state level
        childSnapshot.forEach(function(stateSnap){
          const stateKey = stateSnap.key;
          // Go to city level
          stateSnap.forEach(function(citySnap){
            const cityKey = citySnap.key;
            // Go to food level
            citySnap.forEach(function(foodSnap){
              const foodKey = foodSnap.key;
              // Finally: go to the foodz and remove user
              const dbPath = countryKey +'/' + stateKey + '/'+ cityKey + '/'+ foodKey + '/' + userId ;
              updateObject['rankings-followers/'+dbPath]=null;
            });
          });
        }); // State level
      });
      // The atomic commit
      return database.ref().update(updateObject);
    }//[END: Verify if the user is following rankings]
    return null;
  });
};
