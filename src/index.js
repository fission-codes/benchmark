import * as wn from 'webnative'
let fs;

wn.setup.debug({ enabled: true })

performance.mark('BEGIN_INITIALISE');
wn.initialise({
  permissions: {
    app: {
      name: "Performance",
      creator: "Fission"
    },
  }
}).then(async state => {
  performance.mark('END_INITIALISE')
  performance.measure('INITIALISE', 'BEGIN_INITIALISE');

  switch (state.scenario) {
    case wn.Scenario.NotAuthorised:
      console.warn('not authorised')
      showIds('auth')
      hideIds('leave')
      break;
    case wn.Scenario.AuthCancelled:
      console.warn('auth cancelled')
      showIds('auth')
      hideIds('leave')
      break;
    case wn.Scenario.AuthSucceeded:
    case wn.Scenario.Continuation:
      showIds('leave')
      hideIds('auth')
      fs = state.fs;
    break;
  }  

  const auth = () => {
    wn.redirectToLobby(state.permissions)
  }

  const leave = () => {
    wn.leave()
  }

  document.getElementById('auth').onclick = auth;
  document.getElementById('leave').onclick = leave;

  renderMeasurements();
}).catch(err => {
  console.error(err)
});

const renderMeasurements = () => {
  const measures = performance.getEntriesByType('measure');
  measures.forEach(measureItem => {
    console.log(`${measureItem.name}: ${measureItem.duration}`);
  });
}

const showIds = (...ids) => {
  ids.forEach(id => {
    document.getElementById(id).style.display = 'flex'
  })
}

const hideIds = (...ids) => {
  ids.forEach(id => {
    document.getElementById(id).style.display = 'none'
  })
}