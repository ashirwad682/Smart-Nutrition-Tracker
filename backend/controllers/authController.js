import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  weight: user.weight,
  goal: user.goal
});

export const register = async (req, res) => {
  try {
    const { name, email, password, age, weight, goal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      weight,
      goal
    });

    return res.status(201).json({
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user });
};
