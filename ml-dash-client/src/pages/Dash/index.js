import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {toGlobalId} from "../../lib/relay-helpers";
import {Box, Grid, Markdown} from "grommet";
import Navbar from "./Navbar";
import ExperimentDash from "./ExperimentDash";
import ChartGrid from "./ChartGrid";


export function DashPrepareVariables({username, project, path}) {
  return {
    id: toGlobalId("Directory", `/${username}/${project}/${path ? path : ""}`)
  }
}

export const DashQuery = graphql`
    query DashQuery($id: ID!) {
        directory (id: $id) {
            id
            name
            ... Navbar_directory
            ... ExperimentDash_directory
        }
    }
`;

export default class Dash extends React.Component {

  constructor(props) {
    super(props);
    this.state = {experiments: [], charts: []}
  }

  openExperimentDetails = (experiment, charts = []) => {
    console.log(experiment);
    const location = this.props.match.location;
    console.log(this.state.experiments);
    this.props.router.replace({...location, query: {...location.query, view: "experiment"}});
    if (!!experiment)
      this.setState({experiments: [experiment], charts: charts});
  };

  addExperimentDetails = (experiment, charts = []) => {
    console.log(experiment, charts, this.props);
    const location = this.props.match.location;
    this.props.router.replace({...location, query: {...location.query, view: "experiment"}});

    let _ = [...this.state.experiments, experiment];
    this.setState({experiments: [...new Set(_)], charts: charts})
  };

  closeExperimentPane = () => {
    const location = this.props.match.location;
    const {view, ...restOfQuery} = location.query;
    this.props.router.replace({...location, query: restOfQuery})
  };

  render() {
    console.log(this.props);
    const {directory, match} = this.props;

    const viewMode = match.location.query.view;
    const isExperimentView = viewMode === "experiment";
    console.log(isExperimentView);
    //to change query, do: this.props.router.replace({...location, query: {new_stuff}})

    const columns = isExperimentView ? ['1/2', '1/2'] : ['medium', 'auto'];
    const areas = isExperimentView ? [
      {name: "main", start: [0, 0], end: [0, 0]},
      {name: "side-bar", start: [1, 0], end: [1, 0]}
    ] : [
      {name: "nav", start: [0, 0], end: [0, 0]},
      {name: "main", start: [1, 0], end: [1, 0]},
    ];

    return <Grid fill={true} rows={['auto']}
                 gap="none" columns={columns} areas={areas}>
      {isExperimentView ? null
          : <Navbar directory={directory} gridArea="nav" animation={["fadeIn", "slideRight"]}/>}
      <Box gridArea="main" background='#e6e6e6' fill={true} animation="fadeIn">
        <ExperimentDash directory={directory} openExperimentDetails={this.openExperimentDetails}/>
      </Box>
      {isExperimentView
          ? <Box gridArea="side-bar" background='white' fill={true} animation="fadeIn">
            <button onClick={this.closeExperimentPane}>close</button>
            <ChartGrid experiments={this.state.experiments} charts={this.state.charts}/>
          </Box>
          : null}
    </Grid>;
  }
}