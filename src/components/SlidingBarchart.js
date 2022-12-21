import {DualAxes} from "@ant-design/plots";

export default function ({data}) {
  let newData = [];
  for(let record of data) {
    let date = record.endTime.split(' ')[0];
    let cnt = newData.length;
    if(cnt===0 || newData[cnt-1].time!==date) {
      newData.push({
        'time': date,
        'duration': record.msPlayed,
        'count':1
      });
    }
    else {
      newData[cnt-1].duration += record.msPlayed;
      newData[cnt-1].count++;
    }
  }
  data = newData;
  const config = {
    data: [data,data],
    xField: 'time',
    yField: ['duration','count'],
    limitInPlot: true,
    padding: 'auto',
    // slider: {},
    tooltip:{
      formatter: (item) => {
        if(item.duration) {
          let val = item.duration;
          val /= 1000; val=parseInt(val);
          let s = val%60;

          val /= 60; val=parseInt(val);
          let m = val%60;

          val /= 60;
          let h = parseInt(val);
          let str = '';
          if(h!==0) {
            str = h+'h';
            str += String(m).padStart(2,'0')+'m';
            str += String(s).padStart(2,'0')+'s';
          }
          else if(m!==0) {
            str = m+'m';
            str += String(s).padStart(2,'0')+'s';
          }
          else {
            str = s+'s';
          }
          return {name:"听歌时长",value:str};
        }
        else {
          return {name:"切歌次数",value:item.count};
        }
      }
    },
    geometryOptions: [
      {
        geometry: 'column',
        color:"#F08080",
      },
      {
        geometry: 'line',
      },
    ],
    yAxis: {
      duration:{
        label:{
          formatter: (val,item,index) => {
            return (val/3600000).toFixed(1)+'h';
          },
        },
      },
    },
  }
  return <DualAxes {...config} />
}