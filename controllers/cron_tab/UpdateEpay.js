const express = require('express')
const Wallet = require("../../models/wallet_v1")
const Wallet2 = require("../../models/wallet_v2")
const Users = require("../../models/user")
const updateEpay = async function(){
  var dataUsers = await Users.findOne({email: "hokien1992@gmail.com"})
  console.log(dataUsers)
}
module.exports = updateEpay;
