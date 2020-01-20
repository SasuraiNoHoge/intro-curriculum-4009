'use strict';
import $ from 'jquery';
const block = $('#block');
const scalingButton = $('#scaling-button');
var Chart = require('chart.js');
var ctx = $('#myChart');
var dos = $('#dos');
let n = 1;
let times = [0, 0, 0, 0, 0, 0, 0, 0];

var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['now', '0.25秒前', '0.5秒前', '0.75秒前', '1秒前', '1.25秒前', '1.5秒前'],
    datasets: [
      {
        label: '1分毎',
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: "rgba(255,0,0,1)",
        backgroundColor: "rgba(0,0,0,0)"
      },
      {
        label: '5分毎',
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: "rgba(0,0,255,1)",
        backgroundColor: "rgba(0,0,0,0)"
      },
      {
        label: '15分毎',
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: "rgba(0,255,0,1)",
        backgroundColor: "rgba(0,0,0,0)"
      }
    ],
  },
  options: {
    title: {
      display: true,
      text: 'ロードアベレージ'
    },
    scales: {
      yAxes: [{
        ticks: {
          suggestedMax: 0,
          suggestedMin: 100,
          stepSize: 10,
          callback: function(value, index, values){
            return  value +  '%'
          }
        }
      }]
    },
  }
});

scalingButton.click(() => {
  block.animate({ width: '200pt', height: '200pt' }, 2000);
  block.animate({ width: '100pt', height: '100pt' }, 2000);
});

const movingButton = $('#moving-button');

movingButton.click(() => {
  block.animate({ 'marginLeft': '500px' }, 500);
  block.animate({ 'marginLeft': '20px' }, 1000);
});

const loadavg = $('#loadavg');


import io from 'socket.io-client';
const socket = io('http://localhost:8000');

//bin/wwwで設定した関数を使う
//クライアントからサーバの状況を教えて貰う
//サーバはintervalで時間ごとに値を更新してるのでこちらで呼び出す必要はない
socket.on('server-status', (data) => {

  //console.log(data.datasets[0].loadavg);
  //データの保存が必要
  
  //先にチャートの値を右にずらす
  for(let j = 0; j < myLineChart.data.datasets.length;j++)
  {
    times = myLineChart.data.datasets[j].data;

    for(let i = times.length-1; i > 0; i--)
    {
      myLineChart.data.datasets[j].data[i] = times[i-1];
      times[i] = times[i-1];
    }

    times[0] = data.loadavg[j] * 100;
    myLineChart.data.datasets[j].data[0] = times[0];
  }
  myLineChart.update();
  
  loadavg.text(data.loadavg.join(' : '));
});

socket.on('connect', () => { console.log('接続しました'); });
socket.on('disconnect', () => { console.log('切断しました'); });