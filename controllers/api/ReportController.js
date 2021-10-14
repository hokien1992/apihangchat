const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const User = require("../../models/user")
const Order = require("../../models/order")
const Wallet_v1 = require("../../models/wallet_v1")
const Exchange = require("../../models/exchange")
const Product = require("../../models/product")
const url = require('url')
const reportController = {}
// Tổng số thành viên trong hệ thống
reportController.totalListUser = async function(req, res, next) {
  var totalListUser  = await User.find({}).countDocuments()
  res.send({totalListUser:totalListUser})
}
// Tổng số đại lý
reportController.totalDaily = async function(req, res, next) {
  var totalDaily  = await User.find({level: 2}).countDocuments()
  res.send({totalDaily:totalDaily})
}
// Tổng số đơn hàng dã dặt/ đơn hàng thành công
// Tổng doanh số toàn công ty
reportController.totalOrder = async function(req, res, next) {
  var totalOrder  = await Order.find({}).countDocuments()
  var totalOrderSuccess = await Order.find({status: 2}).countDocuments()
  res.send({totalOrder:totalOrder, totalOrderSuccess:totalOrderSuccess})
}
// Tổng số hoa hồng
reportController.totalCommission = async function(req, res, next) {
  var listWallet  = await Wallet_v1.find({})
  var totalCommission = 0
  for(i=0;i<listWallet.length;i++){
    totalCommission += listWallet[i].w_totalcommisstion
  }
  res.send({totalCommission:totalCommission})
}
// Tổng số hoa hồng đã trả
reportController.totalCommissionPay = async function(req, res, next) {
  var listExchange  = await Exchange.find({type_exchange: 0, status: 1})
  var totalCommissionPay = 0
  for(i=0;i<listExchange.length;i++){
    totalCommissionPay += listExchange[i].number_monney
  }
  res.send({totalCommissionPay:totalCommissionPay})
}
// Tổng số doanh số toàn công ty
reportController.totalSale = async function(req, res, next) {
  var listOrderSuccess = await Order.find({status: 2})
  var totalSale = 0
  for(i=0;i<listOrderSuccess.length;i++){
    totalSale += listOrderSuccess[i].totalPrice
  }
  res.send({totalSale: totalSale})
}
// Tổng số sản phẩm
reportController.totalProduct = async function(req, res, next) {
  var totalProduct  = await Product.find({}).countDocuments()
  res.send({totalProduct:totalProduct})
}
// Mảng doanh so theo từng tháng
reportController.arrTotalMoneyMonthInYear = async function(req, res, next){
  const query = url.parse(req.url,true).query
  if(query.yearCurrent){
    var yearCurrent = query.yearCurrent
  }else{
    var datetimeCurrent = new Date()
    var yearCurrent = datetimeCurrent.getFullYear()
  }
  var start = new Date(yearCurrent, 0, 1, 0, 0, 0, 0);
  var end = new Date(yearCurrent, 11, 31, 0, 0, 0, 0);
  var dataOrder = await Order.aggregate([
    {
    "$match":
      {
        $and: [
          {
            "create_at":
            {
              "$lte": end,
              "$gte": start
            }
          },
          {"status": 2}
        ]
      }
    }
  ])
  const sumArrTotalPrice = dataOrder
  .map( v => v.totalPrice )
  .reduce( (sum, current) => sum + current, 0 )
  const sumTotalOrder = dataOrder.length
  // var monthStartDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth(), 1)
  // var monthEndDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth() + 1, 0)
  // var testDayMonth = {monthStartDay: monthStartDay, monthEndDay: monthEndDay}
  //toISOString()
  var arrNumberMonth = [1,2,3,4,5,6,7,8,9,10,11,12]
  var arrMoneyDayMonth = []
  var testDayMonth = []
  var arrNumberOrderMonth = []
  var totalOrderMonth = 0
  for(i=0;i<arrNumberMonth.length;i++){
    var yearSelect = new Date(yearCurrent+'-'+arrNumberMonth[i])
    var monthStartDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth(), 1)
    var monthEndDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth() + 1, 1)
    testDayMonth.push({monthStartDay: monthStartDay, monthEndDay: monthEndDay})
    var dataOrderMonth = await Order.aggregate([
      {
      "$match":
        {
          $and: [
            {
              "create_at":
              {
                "$lte": monthEndDay,
                "$gte": monthStartDay
              }
            },
            {"status": 2}
          ]
        }
      }
    ])
    // Doanh số thuần hàng tháng
    const sumArrTotalPriceMonth = dataOrderMonth
    .map( v => v.totalPrice )
    .reduce( (sum, current) => sum + current, 0 )
    arrMoneyDayMonth[i]=sumArrTotalPriceMonth
    // Số đơn hàng hàng tháng
    var sumOrderMonth = await Order.aggregate([
      {
      "$match":
        {
          $and: [
            {
              "create_at":
              {
                "$lte": monthEndDay,
                "$gte": monthStartDay
              }
            },
            {"status": 2}
          ]
        }
      }
    ])
    arrNumberOrderMonth[i] = sumOrderMonth.length
    totalOrderMonth += sumOrderMonth.length
  }

  res.send({
    yearCurrent: yearCurrent,
    arrDayYear: {start: start, end: end},
    arrMoneyDayMonth: arrMoneyDayMonth,
    sumArrTotalPrice: sumArrTotalPrice,
    arrNumberOrderMonth: arrNumberOrderMonth,
    sumTotalOrder: sumTotalOrder,
    totalOrderMonth: totalOrderMonth
  })
}
// Mảng đơn hàng theo từng tháng
reportController.arrTotalOrderMonthInYear = async function(req, res, next){
  const query = url.parse(req.url,true).query
  var dataStatus = {}
  if(query.status){
    if(query.status<5){
      dataStatus.status = query.status
    }
  }
  if(query.yearCurrent){
    var yearCurrent = query.yearCurrent
  }else{
    var datetimeCurrent = new Date()
    var yearCurrent = datetimeCurrent.getFullYear()
  }
  var start = new Date(yearCurrent, 0, 1, 0, 0, 0, 0);
  var end = new Date(yearCurrent, 11, 31, 0, 0, 0, 0);

  var arrLevel = []
  for(i=0;i<6; i++){
    var dataOrderLevel = await Order.aggregate([
      {
      "$match":
        {
          $and: [
            {
              "create_at":
              {
                "$lte": end,
                "$gte": start
              },
              status: i
            }
          ]
        }
      }
    ])
    arrLevel[i] = dataOrderLevel.length
  }
  if(dataStatus.status){
    var dataOrder = await Order.aggregate([
      {
      "$match":
        {
          $and: [
            {
              "create_at":
              {
                "$lte": end,
                "$gte": start
              },
              status: dataStatus.status
            }
          ]
        }
      }
    ])
  }else{
    var dataOrder = await Order.aggregate([
      {
      "$match":
        {
          $and: [
            {
              "create_at":
              {
                "$lte": end,
                "$gte": start
              }
            }
          ]
        }
      }
    ])
  }

  const sumArrTotalPrice = dataOrder
  .map( v => v.totalPrice )
  .reduce( (sum, current) => sum + current, 0 )
  const sumTotalOrder = dataOrder.length
  //res.send({dataOrder: dataOrder})
  // var monthStartDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth(), 1)
  // var monthEndDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth() + 1, 0)
  // var testDayMonth = {monthStartDay: monthStartDay, monthEndDay: monthEndDay}
  //toISOString()
  var arrNumberMonth = [1,2,3,4,5,6,7,8,9,10,11,12]
  var arrMoneyDayMonth = []
  var testDayMonth = []
  var arrNumberOrderMonth = []
  var totalOrderMonth = 0
  for(i=0;i<arrNumberMonth.length;i++){
    var yearSelect = new Date(yearCurrent+'-'+arrNumberMonth[i])
    var monthStartDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth(), 1)
    var monthEndDay = new Date(yearSelect.getFullYear(), yearSelect.getMonth() + 1, 1)
    testDayMonth.push({monthStartDay: monthStartDay, monthEndDay: monthEndDay})
    if(dataStatus.status){
      var dataOrderMonth = await Order.aggregate([
        {
        "$match":
          {
            $and: [
              {
                "create_at":
                {
                  "$lte": monthEndDay,
                  "$gte": monthStartDay
                },
                status: dataStatus.status
              }
            ]
          }
        }
      ])
    }else{
      var dataOrderMonth = await Order.aggregate([
        {
        "$match":
          {
            $and: [
              {
                "create_at":
                {
                  "$lte": monthEndDay,
                  "$gte": monthStartDay
                }
              }
            ]
          }
        }
      ])
    }
    // Doanh số thuần hàng tháng
    const sumArrTotalPriceMonth = dataOrderMonth
    .map( v => v.totalPrice )
    .reduce( (sum, current) => sum + current, 0 )
    arrMoneyDayMonth[i]=sumArrTotalPriceMonth
    // Số đơn hàng hàng tháng

    arrNumberOrderMonth[i] = dataOrderMonth.length
    totalOrderMonth += dataOrderMonth.length
  }

  res.send({
    yearCurrent: yearCurrent,
    arrDayYear: {start: start, end: end},
    arrMoneyDayMonth: arrMoneyDayMonth,
    sumArrTotalPrice: sumArrTotalPrice,
    arrNumberOrderMonth: arrNumberOrderMonth,
    sumTotalOrder: sumTotalOrder,
    arrLevel: arrLevel,
    totalOrderMonth: totalOrderMonth
  })
}
module.exports = reportController
