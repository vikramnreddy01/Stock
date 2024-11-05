const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const axios =require('axios')
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
  userEmail: { type: String, required: true }, 
  symbol: { type: String, required: true },
  price: { type: Number, required: true }, 
  quantity: { type: Number, required: true }, 
  date: { type: Date, default: Date.now }, 
  type: { type: String, required: true }, 
});


const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});
const stockLogSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  date: { type: Date, default: Date.now }, // Automatically set the date
  type: { type: String, required: true }, // 'BUY' or 'SELL'
});

const StockLog = mongoose.model('StockLog', stockLogSchema);
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
app.post('/api/transactions/buy', async (req, res) => {
  const { userEmail, symbol, price, quantity } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalCost = price * quantity;

    // Check if user has enough balance
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance to complete the purchase.' });
    }

    // Deduct the balance
    user.balance -= totalCost;
    await user.save();

    // Create a new transaction
    const transaction = new Transaction({
      userEmail,
      symbol,
      price,
      quantity,
      date: new Date(),
      type: 'BUY',
    });
    await transaction.save();

    // Create a new stock log entry
    const stockLog = new StockLog({
      userEmail,
      symbol,
      price,
      quantity,
      totalCost,
      type: 'BUY',
    });
    await stockLog.save();

    res.json({ message: 'Transaction successful!', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: `Error processing transaction: ${error.message}` });
  }
});

// Fetch Stock Data by Symbol Route
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params; // Only extract symbol from params

  try {
    // Find the latest stock entry for the given symbol
    const stockData = await Stock.findOne({ symbol }).sort({ date: -1 }); // Sort by date in descending order
    if (!stockData) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(stockData); // Return the latest stock data
  } catch (error) {
    console.error('Error fetching stock data:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error fetching stock data' });
  }
});
app.get('/api/profit/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const transactions = await StockLog.find({ userEmail: email }); // Get all transactions for the user

    let totalBuy = 0;
    let totalSell = 0;

    transactions.forEach(log => {
      if (log.type === 'BUY') {
        totalBuy += log.totalCost; // Accumulate total cost of bought stocks
      } else if (log.type === 'SELL') {
        totalSell += log.totalCost; // Accumulate total received from sold stocks
      }
    });

    const profit = totalSell - totalBuy; // Calculate profit
    res.json({ profit });
  } catch (error) {
    console.error('Error fetching profit data:', error);
    res.status(500).json({ message: 'Error fetching profit data' });
  }
});


// Fetch Transactions by User Email
app.get('/api/transactions/:userEmail', async (req, res) => {
  const { userEmail } = req.params;

  try {
    const transactions = await Transaction.find({ userEmail });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// In your server file (e.g., server.js or routes/transactionRoutes.js)
app.get('/api/users/transactions/:email', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userEmail: req.params.email });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Server Error');
  }
});


// Sell stock transaction
app.post('/api/transactions/sell', async (req, res) => {
  const { userEmail, symbol, quantity, currentPrice, transactionId } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Check if the quantity to sell is valid
    if (quantity > transaction.quantity) {
      return res.status(400).json({ message: 'Invalid quantity to sell.' });
    }

    // Update transaction
    transaction.quantity -= quantity;
    if (transaction.quantity === 0) {
      // Remove transaction if quantity is zero
      await Transaction.deleteOne({ _id: transactionId });
    } else {
      await transaction.save(); // Save updated transaction
    }

    // Create a sale log entry
    const stockLog = new StockLog({
      userEmail,
      symbol,
      price: currentPrice,
      quantity: quantity, // Positive value to indicate quantity sold
      totalCost: currentPrice * quantity, // Calculate total cost for logging
      type: 'SELL', // Indicate this is a sell transaction
    });
    await stockLog.save();

    return res.status(200).json({ message: 'Stock sold successfully.' });
  } catch (error) {
    console.error('Error selling stock:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});
// Fetch stock log data for the user
app.get('/api/stock-logs/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const stockLogs = await StockLog.find({ userEmail: email }).sort({ createdAt: -1 }); // Sort by date descending
    res.json(stockLogs);
  } catch (error) {
    console.error('Error fetching stock logs:', error);
    res.status(500).json({ message: 'Error fetching stock logs.' });
  }
});

const topStocks = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB',
  'TSLA', 'NVDA', 'BRK.B', 'JPM', 'JNJ',
  'V', 'PG', 'UNH', 'HD', 'MA',
  'DIS', 'PYPL', 'ADBE', 'CMCSA', 'NFLX',
  'KO', 'VZ', 'PFE', 'MRK', 'ABT'
];

async function fetchStockData() {
  const symbols = topStocks;
  
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      // Wait for 15 seconds between each request to stay within the free-tier limit
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=5J63HYIUGKV572IR`);
      const data = response.data['Time Series (Daily)'];
      
      // Check if data is undefined or null
      if (!data) {
        console.error(`No data received for ${symbol}. Response:`, response.data);
        continue;
      }

      const filteredData = Object.keys(data).filter(date => new Date(date) > new Date('2024-11-01')).map(date => {
        return {
          symbol,
          date,
          open: parseFloat(data[date]['1. open']),
          high: parseFloat(data[date]['2. high']),
          low: parseFloat(data[date]['3. low']),
          close: parseFloat(data[date]['4. close']),
          volume: parseInt(data[date]['5. volume']),
        };
      });

      // Save to MongoDB, avoiding duplicates
      for (const record of filteredData) {
        await Stock.updateOne(
          { symbol: record.symbol, date: record.date }, // Check for existing record
          { $set: record }, // Set the data if it doesn't exist
          { upsert: true } // Insert if not present
        );
      }
      
      console.log(`Successfully fetched and saved data for ${symbol}`);
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
    }
  }
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/StockDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    fetchStockData()
  })
  .catch(err => console.log(err));


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
