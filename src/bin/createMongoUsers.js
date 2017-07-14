#!/usr/bin/env node


const MongoClient = require('mongodb').MongoClient

const MongoUserConfigFactory = require('../config/mongo/MongoUserConfigFactory')
const MongoUserLevel = require('../config/mongo/MongoUserLevel')

const feedName = 'mta_subway'

const { buildMongoConnectionString } = require('../config/mongo/utils')


const adminUserRoles = [
  {
    role: "userAdminAnyDatabase",
    db: "admin"
  },
  {
    role: "dbAdminAnyDatabase",
    db: "admin"
  },
  {
    role: "readWriteAnyDatabase",
    db: "admin"
  }
]


const adminUserConfig =
  MongoUserConfigFactory.build({
    feedName,
    userLevel: MongoUserLevel.ADMIN
  })

const readWriteUserConfig =
  MongoUserConfigFactory.build({
    feedName,
    userLevel: MongoUserLevel.READ_WRITE
  })

const readOnlyUserConfig =
  MongoUserConfigFactory.build({
    feedName,
    userLevel: MongoUserLevel.READ_ONLY
  })

const bareMongoURL =
  buildMongoConnectionString({
    host: adminUserConfig.host,
    port: adminUserConfig.port,
  })


MongoClient.connect(bareMongoURL)
  .then(async (db) => {
    try {
      await createUsers(db)
    } catch (err) {
      console.error(err)
    } finally {
      await db.close()
    }
  })
  .then(() => console.log('success'))
  .catch(console.error.bind(console))


async function createUsers (db) {
  await Promise.all([
    createAdminUser(db),
    createReadWriteUser(db),
    createReadOnlyUser(db),
  ])
}


async function createAdminUser (db) {
  await db.admin().addUser(
    adminUserConfig.adminUserName,
    adminUserConfig.adminUserPwd,
    { roles: adminUserRoles }
  )

  console.log('===== Admin user credentials =====')
  console.log('  adminUserName:', adminUserConfig.adminUserName)
  // console.log('  adminUserPwd:', adminUserConfig.adminUserPwd)
  console.log('==================================\n')
}

async function createReadWriteUser (db) {
  await db.admin().addUser(
    readWriteUserConfig.readWriteUserName,
    readWriteUserConfig.readWriteUserPwd,
    { roles: ['readWriteAnyDatabase'] }
  )

  console.log('===== Read/Write user credentials =====')
  console.log('  readWriteUserName:', readWriteUserConfig.readWriteUserName)
  // console.log('  readWriteUserPwd:', readWriteUserConfig.readWriteUserPwd)
  console.log('=======================================\n')
}

async function createReadOnlyUser (db) {
  await db.admin().addUser(
    readOnlyUserConfig.readOnlyUserName,
    readOnlyUserConfig.readOnlyUserPwd,
    { roles: ['readAnyDatabase'] }
  )

  console.log('===== Read/Only user credentials =====')
  console.log('  readOnlyUserName:', readOnlyUserConfig.readOnlyUserName)
  // console.log('  readOnlyUserPwd:', readOnlyUserConfig.readOnlyUserPwd)
  console.log('======================================\n')
}

