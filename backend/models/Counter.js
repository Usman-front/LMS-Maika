import mongoose from 'mongoose'

const CounterSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  seq: { type: Number, default: 0 },
})

const Counter = mongoose.model('Counter', CounterSchema)

export default Counter

export async function nextId(name) {
  const c = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return c.seq
}
