const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/StockDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Schemas and Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 0 },
});

const stockSchema = new mongoose.Schema({
  symbol: String,
  date: String,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
});

const transactionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // Change userId to userEmail
  symbol: { type: String, required: true }, // Added required validation for symbol
  price: { type: Number, required: true }, // Added required validation for price
  quantity: { type: Number, required: true }, // Added required validation for quantity
  date: { type: Date, default: Date.now }
});


const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const User = mongoose.model('User', userSchema);
const Stock = mongoose.model('Stock', stockSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Routes

// Registration Route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(400).json({ message: `Error registering user: ${error.message}` });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ message: 'Login successful!', token });
  } catch (error) {
    res.status(500).json({ message: `Error during login: ${error.message}` });
  }
});

// Fetch User Data Route (for name and balance)
app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email }, 'name balance'); // Select only name and balance
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ name: user.name, balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: `Error fetching user data: ${error.message}` });
  }
});

// Update User Details Route
app.patch('/api/users/update', async (req, res) => {
  const { email, name, balance } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user details
    if (name) user.name = name;
    if (typeof balance === 'number') user.balance = balance;

    await user.save();
    res.json({ message: 'User details updated successfully', user: { name: user.name, balance: user.balance } });
  } catch (error) {
    res.status(500).json({ message: `Error updating user details: ${error.message}` });
  }
});

// Change Password Route
app.post('/api/users/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10); // Hash new password
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error changing password: ${error.message}` });
  }
});

// Fetch User Balance Route
app.get('/api/users/:email/balance', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: `Error fetching balance: ${error.message}` });
  }
});

// Update Balance Route
app.post('/api/users/update-balance', async (req, res) => {
  const { email, amount } = req.body;

  // Check if amount is a valid positive number
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount. Please enter a positive number.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.balance += amount; // Update balance
    await user.save();

    res.json({ message: 'Balance updated successfully', balance: user.balance });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ message: 'Error updating balance' });
  }
});

// Contact Form Submission Route
app.post('/api/contact', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json({ message: 'Contact information saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving contact information' });
  }
});

// Fetch Stock Data with Range
app.get('/api/stocks', async (req, res) => {
  const { symbol, range } = req.query;
  const today = new Date();
  let startDate;

  // Calculate start date based on range
  if (range === '5d') startDate = new Date(today.setDate(today.getDate() - 5));
  else if (range === '1m') startDate = new Date(today.setMonth(today.getMonth() - 1));
  else if (range === '6m') startDate = new Date(today.setMonth(today.getMonth() - 6));
  else if (range === '1y') startDate = new Date(today.setFullYear(today.getFullYear() - 1));
  else startDate = new Date('1970-01-01');

  try {
    const query = { symbol, date: { $gte: startDate.toISOString().split('T')[0] } };
    const stocks = await Stock.find(query).sort({ date: 1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock data' });
  }
});
// Buy Stock Transaction Route
app.post('/api/transactions/buy', async (req, res) => {
  const { userEmail, symbol, price, quantity } = req.body; // Changed userId to userEmail

  try {
    // Find the user by email instead of ID
    const user = await User.findOne({ email: userEmail }); // Using findOne to search by email
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalCost = price * quantity;

    // Check if user has enough balance
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance to complete the purchase.' });
    }

    // Deduct the balance
    user.balance -= totalCost;
    await user.save();

    // Create a new transaction using userEmail instead of userId
    const transaction = new Transaction({ userEmail, symbol, price, quantity });
    await transaction.save();

    res.json({ message: 'Transaction successful!', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: `Error processing transaction: ${error.message}` });
  }
});

// Fetch Stock Data by Symbol Route
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol, close,open,low,volume} = req.params;

  try {
    const stockData = await Stock.findOne({ symbol });
    if (!stockData) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock data' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
