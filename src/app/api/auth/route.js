import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { action, email, password, fullName, phone, address } = await request.json();

    if (!action) {
      return NextResponse.json({ success: false, message: 'Action is required' }, { status: 400 });
    }

    const conn = await connectToDatabase();

    // 1. REGISTER
    if (action === 'register') {
      if (!email || !password || !fullName || !phone) {
        return NextResponse.json(
          { success: false, message: 'Full name, email, phone, and password are required' },
          { status: 400 }
        );
      }

      if (conn) {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 });
        }

        const newUser = await User.create({
          fullName,
          email: email.toLowerCase(),
          phone,
          password, // for production, hash with bcrypt
          role: email.includes('admin') ? 'admin' : 'customer',
          loyaltyPoints: 100, // 100 bonus signup loyalty points
          savedAddresses: address ? [address] : [],
        });

        const userObj = newUser.toObject();
        delete userObj.password;

        return NextResponse.json({
          success: true,
          message: 'Account created successfully! You earned 100 Quickmart Loyalty Points.',
          user: { ...userObj, id: newUser._id.toString() },
        });
      }

      // Offline mock register
      const mockUser = {
        id: 'usr_' + Date.now(),
        fullName,
        email: email.toLowerCase(),
        phone,
        role: email.includes('admin') ? 'admin' : 'customer',
        loyaltyPoints: 100,
        savedAddresses: address ? [address] : [],
      };



      return NextResponse.json({
        success: true,
        message: 'Account created! (Local session)',
        user: mockUser,
      });
    }

    // 2. LOGIN
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
      }

      if (conn) {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) {
          return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
        }

        const userObj = user.toObject();
        delete userObj.password;

        return NextResponse.json({
          success: true,
          message: `Welcome back, ${user.fullName}!`,
          user: { ...userObj, id: user._id.toString() },
        });
      }

      // Mock login for offline dev
      const mockUser = {
        id: 'usr_demo_882',
        fullName: email.split('@')[0].toUpperCase(),
        email: email.toLowerCase(),
        phone: '0712345678',
        role: email.includes('admin') ? 'admin' : 'customer',
        loyaltyPoints: 140,
        savedAddresses: [
          {
            fullName: email.split('@')[0],
            phone: '0712345678',
            street: 'Argwings Kodhek Rd',
            building: 'Silver Oaks, Apt 4B',
            city: 'Nairobi',
            isDefault: true,
          },
        ],
      };

      return NextResponse.json({
        success: true,
        message: 'Signed in successfully!',
        user: mockUser,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

