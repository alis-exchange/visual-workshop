<template>
  <v-card
    :loading="loading"
    class="rounded-0"
    width="100%"
    height="100%"
  >
    <v-card-text>
      <v-container>
        <div
          ref="chart"
          class="line-chart"
          :style="`height: ${chartHeight}px; width: 100%;`"
        />
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>

import testData from "./testingData/QuarterlyCountryExposure.json";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { colors as colours } from "@/config/constants"; //can use these colours if needed
import {mapActions} from "vuex";

export default {
  name: "CountryExposure",
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      }
    },
    selectedPortfolios: {
      type: Array,
      default: () => {
        return [];
      }
    },
    selectedBranches: {
      type: Array,
      default: () => {
        return [];
      }
    },
    maxCountries:
      {
        type: Number,
        default: 5
      },
  },
  data() {
    return {
      chartHeight: 600,
      loading: false,
      skipQuery: true,
      skipPoll: true,
      chart: null,
      zoomBtns: [
        {
          label: '1wk',
          value: 7,
          unit: 'days'
        },
        {
          label: '1m',
          value: 1,
          unit: 'months'
        },
        {
          label: '3m',
          value: 3,
          unit: 'months'
        },
        {
          label: '6m',
          value: 6,
          unit: 'months'
        },
        {
          label: '1yr',
          value: 1,
          unit: 'years'
        },
        {
          label: '2yr',
          value: 2,
          unit: 'years'
        },
        {
          label: '3yr',
          value: 3,
          unit: 'years'
        },
        {
          label: '5yr',
          value: 5,
          unit: 'years'
        },
      ],
    };
  },
  computed: {
    dev() {
      // In development mode the component will then use the default example data object instead of making graphql hits. View the component at http://localhost:3000/playground in dev mode
      return process.env.NODE_ENV === 'development';
    },
    chartData()
    {
      return this.wrangleData(testData);
    },
  },
  watch:
  {
    selectedBranches:
    {
      deep: true,
      handler(newVal)
      {
        this.updateChart(this.wrangleData(newVal));
      }
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  mounted() {
    this.createPlot(); //create chart element
    // this executes when component is in dev mode. Since no resources will be selected, we need the mounted hook to call initChart
    if (this.dev) {
      this.updateChart(this.wrangleData(testData)); //wrangle data of static testing data object into chart ready format
    } else {  // this executes when component is not in dev mode
      if (this.selectedBranches.length > 0) {
        this.$apollo.queries.batchGetBranchMetrics.setVariables({
          branchNames: this.selectedBranches
        });
        this.skipQuery = false;
      } else {
        //send notification to user that they need to select branches
        this.pushSnackbar({
          text: "The SectorContributionComparison component needs selected branches",
          color: "error"
        });
      }
    }
  },
  methods:
  {
    ...mapActions("global", [
      "closePopup", "pushSnackbar", "closeSnackbar"
    ]),
    wrangleData(primaryJson)
    {
      /* we create a nested structure
      {
        "2022-03-15":
        [
          {
            "country": "USA",
            "branches":
            [
              {
                "branch": "North",
                "exposure": 1.2
              },
              {
                "branch": "South",
                "exposure": 0.8
              },
            ]
          },
          {
            "country": "Germany",
            "branches":
            [
              {
                "branch": "North",
                "exposure": 1.5
              },
              {
                "branch": "South",
                "exposure": 0.2
              },
            ]
          },
        ]
      }
       */
      const temp = {};
      primaryJson.exposures.forEach(branch =>
      {
        branch.exposures_branch.average_portfolio_exposures_per_period.historical_exposures.forEach(info =>
        {
          const branchName = branch.branch_display_name;
          const dateValue = Object.values(info.effective_date).map(item => item < 10 ? '0' + item : item).join('-');
          if (!temp[dateValue]) temp[dateValue] = {};
          const levelOne = temp[dateValue];
          info.entity_exposures.forEach(country =>
          {
            if (!levelOne[country.entity_id]) levelOne[country.entity_id] = {};
            const levelTwo = levelOne[country.entity_id];
            levelTwo[branchName] = country.exposure;
          });
        });
      });
      const branches = {};
      // sort countries
      Object.keys(temp).forEach(date =>
      {
        temp[date] = Object.entries(temp[date]).map(([key, val]) => ({
          country: key,
          branches: Object.entries(val).map(([branch, exposure]) =>
          {
            branches[branch] = true;
            return {
              branch,
              exposure,
            };
          })
        })).sort((a, b) =>
        {
          const totalExposureA = a.branches.reduce((acc, val) => acc + val.exposure, 0);
          const totalExposureB = b.branches.reduce((acc, val) => acc + val.exposure, 0);
          a.total = totalExposureA;
          b.total = totalExposureB;
          return totalExposureB - totalExposureA;
        });
      });
      return {
        branches: Object.keys(branches),
        wrangled: temp,
      };
    },
    createPlot() {
      //create chart element
      const chart = am4core.create(
        this.$refs.chart,
        am4charts.XYChart
      );

      chart.maxHeight = this.chartHeight;

      // add cursor and scrollbar
      chart.cursor = new am4charts.XYCursor();
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarY = new am4core.Scrollbar();

      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      xAxis.dataFields.category = "category";
      xAxis.renderer.minGridDistance = 20;
      xAxis.renderer.grid.template.location = 0;
      xAxis.dataItems.template.text = "{country}";
      xAxis.adapter.add("tooltipText", function(txt, target) // eslint-disable-line no-unused-vars
      {
        return xAxis.tooltipDataItem.dataContext.country + ' (' + xAxis.tooltipDataItem.dataContext.category.split('_')[0] + ')';
      });
      xAxis.renderer.labels.template.rotation = -90;
      xAxis.renderer.labels.template.horizontalCenter = 'right';
      xAxis.renderer.labels.template.verticalCenter = 'middle';

      chart.yAxes.push(new am4charts.ValueAxis());

      let legend = new am4charts.Legend();
      legend.position = 'bottom';
      chart.legend = legend;

      this.chart = chart;
    },
    updateChart(data)
    {
      const xAxis = this.chart.xAxes.getIndex(0);
      const series = this.chart.series;
      // we have to reset the series - because we do not recreate the chart when updating the values (to speedup the things a little)
      while (series.length > 0) series.removeIndex(0).dispose();
      const ranges = xAxis.axisRanges;
      ranges.clear();

      // create series - https://codepen.io/team/amcharts/pen/OJLxoPd
      let colorIndex = 0;
      const categories = {};
      data.branches.forEach(bName =>
      {
        const column = series.push(new am4charts.ColumnSeries());
        column.dataFields.categoryX = 'category';
        column.dataFields.valueY = 'value';
        column.dataFields.branch = 'branch';
        column.branch = bName; // we need both - otherwise the property is missing from "currentSeries" in the tooltip adapter below
        column.name = bName;
        column.fill = am4core.color(colours[colorIndex++ % colours.length]);
        column.strokeWidth = 2;
        column.columns.template.strokeWidth = 0;
        column.columns.template.width = am4core.percent(80);
        column.adapter.add('tooltipHTML', (txt, target) =>
        {
          const currentSeries = target.tooltipDataItem;
          const idx = currentSeries.index;
          if (idx < 0) return '';
          let text = '';
          this.chart.series.each(item =>
          {
            if (item.branch === currentSeries.branch)
            {
              const dataPoint = item.data[idx];
              if (dataPoint.country === 'Other')
              {
                dataPoint.countries.forEach(country =>
                {
                  const branch = country.branches.find(branch => branch.branch === dataPoint.branch);
                  if (branch)
                  {
                    text += '<tr><td>' + country.country + ':</td><td align="right">' + branch.exposure.toFixed(6) + '</td></tr>';
                  }
                });
                text = "<table><thead><tr style='font-weight: bold;'><td>Overall:</td><td align='right'>" + currentSeries.dataContext.value.toFixed(6) + "</td></tr></thead><tbody>" + text + '</tbody></table>';
              }
              else text = dataPoint.country + ': ' + (100 * dataPoint.value).toFixed(3) + '%';
            }
          });
          return text;
        });

        const values = [];
        Object.entries(data.wrangled).sort((a, b) =>
        {
          if (a[0] < b[0]) return +1;
          if (a[0] > b[0]) return -1;
          return 0;
        }).forEach(([dateValue, countries]) =>
        {
          const topN = countries.slice(0, this.maxCountries);
          if (countries.length > topN.length)
          {
            const other = {};
            const restCountries = countries.slice(this.maxCountries);
            restCountries.forEach(item =>
            {
              item.branches.forEach(branch =>
              {
                other[branch.branch] = (other[branch.branch] || 0) + branch.exposure;
              });
            });
            topN.push({
              country: 'Other',
              branches: Object.entries(other).map(([bName, exposure]) => ({
                branch: bName,
                exposure,
              })),
              countries: restCountries,
            });
          }
          topN.forEach(item =>
          {
            const category = dateValue + '_' + item.country;
            categories[category] = true;
            item.branches.forEach(branch =>
            {
              if (branch.branch === bName)
              {
                values.push({
                  category,
                  value: branch.exposure,
                  date: dateValue,
                  country: item.country,
                  branch: bName,
                  countries: item.countries,
                });
              }
            });
          });
          this.createRanges(xAxis, dateValue + '_' + topN[0].country, dateValue + '_' + topN[topN.length - 1].country, dateValue);
        });
        column.data = values;
      });
      // it is very important to set the axis data - otherwise the whole chart will be empty (https://www.amcharts.com/docs/v4/concepts/series/#Note_about_Series_data_and_Category_axis)
      xAxis.data = Object.keys(categories).map(category => ({
        category,
        country: category.split('_')[1], // we need this for tooltips
      }));
    },
    createRanges(axis, from, to, label)
    {
      const range = axis.axisRanges.create();
      range.category = from;
      range.endCategory = to;
      range.label.text = label;
      range.label.rotation = 0;
      range.label.paddingTop = 100;
      range.label.location = 0.5;
      range.label.horizontalCenter = "middle";
      range.label.fontSize = 12;
      range.label.fontWeight = "bolder";
      range.label.truncate = true;
      range.label.tooltipText = label;
      range.locations.category = 0;
      range.locations.endCategory = 1;
      range.grid.disabled = true;

      // add a tick on the border between dates
      const tickRange = axis.axisRanges.create();
      tickRange.category = to;
      tickRange.label.text = '';
      tickRange.grid.strokeOpacity = 1;
      tickRange.grid.strokeWidth = 1;
      tickRange.locations.category = 1;
      tickRange.tick.disabled = false;
      tickRange.tick.stroke = am4core.color('#000');
      tickRange.tick.strokeWidth = 1;
      tickRange.tick.strokeOpacity = 1;
      tickRange.tick.length = 120;
      tickRange.tick.location = 0;
    }
  },
};
</script>
