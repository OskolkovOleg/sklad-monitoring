import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import type { AuthOptions } from 'next-auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            department: true,
            isActive: true,
            image: true,
          },
        })

        if (!user || !user.password || !user.isActive) {
          return null
        }

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.department = token.department
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
