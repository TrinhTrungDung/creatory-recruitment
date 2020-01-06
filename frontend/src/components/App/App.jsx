import React, { Component } from "react";
import axios from "axios";

import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import ReactFC from "react-fusioncharts";

import Dropdown from "react-dropdown";

import { Container, Nav } from "../styled-components";
import "../chart-themes";

ReactFC.fcRoot(FusionCharts, Charts);

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
      dropdownOptions: [],
      selectedValue: null,
      totalSubs: 0,
      totalViews: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalShares: 0,
      totalComments: 0,
      viewsByVideo: [],
      subsByVideo: [],
      likesByVideo: [],
      dislikesByVideo: [],
      sharesByVideo: [],
      commentsByVideo: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  getData = dropDownOption => {
    const data = this.state.data;
    let selectedValue = null,
      totalSubs = 0,
      totalViews = 0,
      totalLikes = 0,
      totalDislikes = 0,
      totalShares = 0,
      totalComments = 0,
      viewsByVideo = [],
      subsByVideo = [],
      likesByVideo = [],
      dislikesByVideo = [],
      sharesByVideo = [],
      commentsByVideo = [];

    for (let i = 0; i < data.length; i++) {
      if (dropDownOption === data[i]["channel_name"]) {
        let label = data[i].video_title;
        totalSubs += parseInt(data[i].sub_count);
        totalViews += parseInt(data[i].unsub_views);
        totalLikes += parseInt(data[i].unsub_likes);
        totalDislikes += parseInt(data[i].unsub_dislikes);
        totalShares += parseInt(data[i].unsub_shares);
        totalComments += parseInt(data[i].comments);
        viewsByVideo.push({
          label: label,
          value: data[i].unsub_views
        });
        subsByVideo.push({
          label: label,
          value: data[i].sub_count
        });
        likesByVideo.push({
          label: label,
          value: data[i].unsub_likes
        });
        dislikesByVideo.push({
          label: label,
          value: data[i].unsub_dislikes
        });
        sharesByVideo.push({
          label: label,
          value: data[i].unsub_shares
        });
        commentsByVideo.push({
          label: label,
          value: data[i].comments
        });
      }
    }

    this.setState({
      data,
      selectedValue,
      totalSubs,
      totalViews,
      totalLikes,
      totalDislikes,
      totalShares,
      totalComments,
      viewsByVideo,
      subsByVideo,
      likesByVideo,
      dislikesByVideo,
      sharesByVideo,
      commentsByVideo
    });
  };

  updateDashboard = event => {
    this.getData(event.value);
    this.setState({ selectedValue: event.value });
  };

  fetchData = () => {
    axios("/results")
      .then(response => {
        const data = response.data;
        let dropdownOptions = [];

        for (let i = 0; i < data.length; i++) {
          dropdownOptions.push(data[i].channel_name);
        }

        dropdownOptions = Array.from(new Set(dropdownOptions));

        this.setState(
          {
            data: data,
            dropdownOptions: dropdownOptions,
            selectedValue: dropdownOptions[0]
          },
          () => this.getData(dropdownOptions[0])
        );
      })
      .catch(error => this.setState({ isLoading: false, error }));
  };

  renderMetricCard = (title, metric, unit, size = "small") => {
    let cardClassName = "is-light-text mb-4";

    if (size === "big") {
      cardClassName += " col-lg-6 col-md-6";
    } else {
      cardClassName += " col-md-3 col-md-3";
    }

    return (
      <Container className={cardClassName}>
        <Container className="card grid-card is-card-dark">
          <Container className="card-heading mb-3">
            <Container className="is-dark-text-light letter-spacing text-small">
              {title}
            </Container>
          </Container>
          <Container className="card-value pt-4 text-x-large">
            {metric}
            <span className="text-medium pl-2 is-dark-text-light">{unit}</span>
          </Container>
        </Container>
      </Container>
    );
  };

  renderChart = (caption, metricName, data) => {
    return (
      <Container className="col-md-6 mb-4">
        <Container className="card is-card-dark chart-card">
          <Container className="chart-container large full-height">
            <ReactFC
              {...{
                type: "column2d",
                width: "100%",
                height: "100%",
                dataFormat: "json",
                containerBackgroundOpacity: "0",
                dataEmptyMessage: "Loading data...",
                dataSource: {
                  chart: {
                    theme: "front-end",
                    caption: caption,
                    yAxisName: metricName
                  },
                  data: data
                }
              }}
            />
          </Container>
        </Container>
      </Container>
    );
  };

  render() {
    return (
      <Container>
        <Nav className="navbar navbar-expand-lg fixed-top is-white is-dark-text">
          <Container className="navbar-brand h1 mb-0 text-large font-medium">
            Video Measurements Dashboard
          </Container>
        </Nav>

        <Nav className="navbar fixed-top nav-secondary is-dark is-light-text">
          <Container className="text-medium">Channel</Container>
          <Container className="navbar-nav ml-auto">
            <Dropdown
              className="pr-2"
              options={this.state.dropdownOptions}
              onChange={this.updateDashboard}
              value={this.state.selectedValue}
              placeholder={this.state.dropdownOptions[0]}
            />
          </Container>
        </Nav>

        <Container className="container-fluid pr-5 pl-5 pt-5 pb-5">
          <Container className="row">
            {this.renderMetricCard(
              "Total Views",
              this.state.totalViews,
              "views",
              "big"
            )}
            {this.renderMetricCard(
              "Total Subscribers",
              this.state.totalSubs,
              "subscribers",
              "big"
            )}
          </Container>

          <Container className="row">
            {this.renderMetricCard(
              "Total Likes",
              this.state.totalLikes,
              "likes"
            )}
            {this.renderMetricCard(
              "Total Dislikes",
              this.state.totalDislikes,
              "dislikes"
            )}
            {this.renderMetricCard(
              "Total Shares",
              this.state.totalShares,
              "shares"
            )}
            {this.renderMetricCard(
              "Total Comments",
              this.state.totalComments,
              "comments"
            )}
          </Container>

          <Container className="row" style={{ minHeight: "400px" }}>
            {this.renderChart(
              "Number of Views",
              "Views",
              this.state.viewsByVideo
            )}
            {this.renderChart(
              "Number of Subscribers",
              "Subscribers",
              this.state.subsByVideo
            )}
          </Container>

          <Container className="row" style={{ minHeight: "400px" }}>
            {this.renderChart(
              "Number of Likes",
              "Likes",
              this.state.likesByVideo
            )}
            {this.renderChart(
              "Number of Dislikes",
              "Dislikes",
              this.state.dislikesByVideo
            )}
          </Container>

          <Container className="row" style={{ minHeight: "400px" }}>
            {this.renderChart(
              "Number of Shares",
              "Shares",
              this.state.sharesByVideo
            )}
            {this.renderChart(
              "Number of Comments",
              "Comments",
              this.state.commentsByVideo
            )}
          </Container>
        </Container>
      </Container>
    );
  }
}
