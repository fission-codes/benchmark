import * as wn from "webnative";
import feather from 'feather-icons';
import {
  showIds,
  hideIds,
  renderMeasurements,
  setContent,
  setClickHandler,
} from "./ui";
import { initFilesystem } from "./filesystem";

showIds("loading");
hideIds("welcome", "user", "filesystem");
feather.replace();
wn.setup.debug({ enabled: true });

performance.mark("BEGIN_INITIALISE");
wn.initialise({
  permissions: {
    app: {
      name: "Benchmark",
      creator: "Fission",
    },
  },
})
  .then(async (state) => {
    performance.mark("END_INITIALISE");
    performance.measure("INITIALISE", "BEGIN_INITIALISE");

    switch (state.scenario) {
      case wn.Scenario.NotAuthorised:
        console.warn("not authorised");
        showIds("welcome");
        hideIds("user");
        break;
      case wn.Scenario.AuthCancelled:
        console.warn("auth cancelled");
        showIds("welcome");
        hideIds("user");
        break;
      case wn.Scenario.AuthSucceeded:
      case wn.Scenario.Continuation:
        showIds("user");
        hideIds("welcome");
        setContent("username", state.username);
        initFilesystem(state.fs);
        break;
    }

    const auth = () => {
      return wn.redirectToLobby(state.permissions);
    };

    const leave = () => {
      wn.leave();
    };

    setClickHandler("auth", auth);
    setClickHandler("leave", leave);
    hideIds("loading");

    renderMeasurements();
  })
  .catch((err) => {
    console.error(err);
  });
