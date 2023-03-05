import axios from "axios";
import { useEffect, useState } from "react";
import { Prefecture } from "./collection/prefecture.collection";

 // 配送情報の型定義
type DeliveryInfoType = {offset_days:number,display_num:number}

// 曜日の定義
const dayList :string[]=[
  '日',
  '月',
  '火',
  '水',
  '木',
  '金',
  '土',
]


function App() {

  const [deliveryInfo,setDeliveryInfo]= useState<DeliveryInfoType|null>(null)

  const [sendDateValue,setSendDateValue]=useState(0);

  const getDeliveryInfo = (id: number) => {
    axios
      .get(`http://localhost:8000/api/delivery?prefecture_id=${id}`)
      .then((res) => {
        setDeliveryInfo(res.data.data.delivery)
      });
      setSendDateValue(0);
  };

  const getDateList=()=>{
    const result:string[]=['---'];
    if(!deliveryInfo) return result
    const {offset_days,display_num}=deliveryInfo

    const formatDate=(date:Date)=>{
      return {year:date.getFullYear(),month:date.getMonth()+1,date:date.getDate(),day:dayList[date.getDay()]}
    }
    const skipDate : number[] = [0,6];

    let skipCount = 0;
    for (let i = 0; i < display_num; i++) {
      // 金曜日start
      const tmpDate = new Date();
      tmpDate.setDate(tmpDate.getDate() + (i + offset_days) + skipCount);
      const checkDate = () => {
        const tmpDay = tmpDate.getDay();
        if (skipDate.includes(tmpDay)) {
          skipCount++;
          tmpDate.setDate(tmpDate.getDate() + 1);
          checkDate();
        }
      }
      checkDate();

      const format = formatDate(tmpDate);
      const {year, month, date, day} = format;
      result.push(`${year}年${month}月${date}日(${day})`);
    }
    return result;
  }

  const changePrefecture = (value: number)=> {
    setSendDateValue(value);
  }

  useEffect(() => {
    getDeliveryInfo(1);
  }, []);
  return (
    <div>
      <div className="container">
        <h1>配送日指定システム</h1>
        <h2>下記から配送日希望日をご指定ください</h2>
        <div className="contents">
          <div className="left_item">
            <span>都道府県</span>
          </div>
          <div className="right_item">
            <select
              onChange={(e) => getDeliveryInfo(Number(e.target.value))}
              id="prefecture_list"
            >
              {Prefecture.list.map((data, i) => (
                <option key={`prefeture_${i}`} value={data.id}>
                  {data.name}
                </option>
              ))}
              {/* @foreach($prefectures as $pref_id => $name)
                <option value="{{ $pref_id }}">{{ $name }}</option>
                @endforeach */}
            </select>
          </div>
        </div>
        <div className="contents">
          <div className="left_item">
            <span>配送希望日</span>
          </div>
          <div className="right_item">
            <select onChange={(e)=>changePrefecture(Number(e.target.value)|| 0)} value={sendDateValue}>
            {getDateList().map((data, i) => (
                <option key={`date_${i}`} value={i}>
                  {data}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
