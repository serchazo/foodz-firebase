// When we receive an http alert from the Cron job, we update the rankings

exports.handler = function(request,response, database) {
  const restoPointsRef = database.ref('resto-points');
  const rankingTopRef = database.ref('ranking-top');
  var testString = 'empty';
  const updateObject = {};

  return restoPointsRef.once('value', function(snapshot){
    var count = 0;
    snapshot.forEach(function(countrySnap){
      var countryId = countrySnap.key;
      // Get the states
      countrySnap.forEach(function(stateSnap){
        var stateId = stateSnap.key;
        // Get the cities
        stateSnap.forEach(function(citySnap){
          var cityId = citySnap.key;
          // Get the rankings
          citySnap.forEach(function(rankingSnap){
            var rankingId = rankingSnap.key;
            // Get the key and nb points and put in the sortable array
            var sortable = [];
            rankingSnap.forEach(function(restoSnap){
              var nbPoints = restoSnap.child('points').val();
              sortable.push([restoSnap.key, nbPoints]);
            });
            // Now sort
            sortable.sort(function(a,b){
              return b[1] - a[1];
            });
            // Create the update object
              // Only the first 5
              for(position = 0 ; position < sortable.length && position < 5; position ++){
                updateObject['ranking-top/'+countryId+'/'+stateId+'/'+cityId+'/'+rankingId+'/'+sortable[position][0]+'/position']=(position+1);
              }
          });
        });
      });
      // Then >> go ninja go!
      count += 1;
      if (count == snapshot.numChildren()){
        // The atomic commit
        return database.ref().update(updateObject);
      }
    });
    return response.send('Update Requested');
  });
};
