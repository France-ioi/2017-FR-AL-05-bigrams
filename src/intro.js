import React from 'react';
import EpicComponent from 'epic-component';

const Task1 = EpicComponent(self => {

  self.render = function () {
    return (
      <div className="taskInstructions">
        <h1>TODO</h1>
      </div>
    );
  };
});

const Task2 = EpicComponent(self => {
  self.render = function () {
    return (
      <div className="taskInstructions">
        <h1>TODO</h1>
      </div>
    );
  }
});

export default EpicComponent(self => {
  self.render = function () {
    const {version, baseUrl} = self.props;
    switch (version) {
      case 1: return <Task1 baseUrl={baseUrl}/>;
      case 2: return <Task2 baseUrl={baseUrl}/>;
      default: return false;
    }
  };
});
