import { config } from 'dotenv'
config()
import { db } from '../index'
import { users } from './auth'

async function test() {
  try {
    console.log('Testing simple query...')
    const result = await db.select().from(users).limit(1)
    console.log('Simple query success:', result.length > 0 ? 'Found user' : 'No users')
    
    console.log('Testing findMany with relations...')
    const resultWithRel = await db.query.users.findMany({
      limit: 1,
      with: {
        sellerBrands: true
      }
    })
    console.log('Relation query success:', resultWithRel.length > 0 ? 'Found user with rel' : 'No users')
  } catch (error) {
    console.error('DATABASE ERROR:', error)
  }
}

test()
