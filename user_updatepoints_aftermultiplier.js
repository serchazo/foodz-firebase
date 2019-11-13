'user-strict';

exports.handler = function(userId,change,database){
  const userRankingDetailRef = database.ref('user-ranking-detail');

  //
  var multiplierBefore = change.before.val();
  var multiplierAfter = change.after.val();
  if (multiplierAfter == null){ multiplierAfter = 0;}
  console.log(multiplierAfter);

  const updateObject = {};

  if (multiplierAfter != multiplierBefore){
    // Get the user snapshot
    return userRankingDetailRef.child(userId).once('value', function(snapshot){
      // 1. Get the countries
      snapshot.forEach(function(countrySnap) {
        const countryKey = countrySnap.key;
        // 2. Get the states
        countrySnap.forEach(function(stateSnap) {
          const stateKey = stateSnap.key;
          // 3. Get the cities
          stateSnap.forEach(function(citySnap){
            const cityKey = citySnap.key;
            //4. Get the foodz
            citySnap.forEach(function(foodzSnap){
              const foodId = foodzSnap.key;
              //5. Get the restos
              foodzSnap.forEach(function(restoSnap){
                const restoId = restoSnap.key;

                const restoPos = restoSnap.child('position').val();

                console.log('pos: '+restoPos);

                var positionMultiple = 10 - restoPos + 1;
                // Correct for the positions higher than 10
                if (positionMultiple < 0) {positionMultiple =1;}

                // New points given for this user

                const newPoints = Math.ceil(multiplierAfter * positionMultiple * 0.1);

                // Update Object
                updateObject['user-ranking-points/'+userId+'/'+countryKey + '/' + stateKey + '/' + cityKey +'/'+foodId + '/' + restoId+'/points']=newPoints;

              });//5.
            }); //4.
          });//3.
        });//2.
      });// 1.

      // The atomic commit
      return database.ref().update(updateObject);
    });// Snap
  }
  else return null;
};
