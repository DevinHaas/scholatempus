"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Apple, Mail } from "lucide-react"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { z } from "zod"

interface LoginScreenProps {
  onLogin: (email: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = loginSchema.parse({ email, password })

      // Simulate login process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onLogin(validatedData.email)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Simulate social login
    onLogin(`user@${provider.toLowerCase()}.com`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">SchulaTempus</h1>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-balance">Willkommen zurück</CardTitle>
            <CardDescription className="text-muted-foreground">Melden Sie sich mit Ihrem Konto an</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 bg-transparent"
                onClick={() => handleSocialLogin("Apple")}
              >
                <Apple className="w-4 h-4 mr-2" />
                Mit Apple anmelden
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 bg-transparent"
                onClick={() => handleSocialLogin("Google")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Mit Google anmelden
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Oder weiter mit</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-Mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@beispiel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Passwort
                  </Label>
                  <button type="button" className="text-sm text-primary hover:underline">
                    Passwort vergessen?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 ${errors.password ? "border-destructive" : ""}`}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Noch kein Konto? <button className="text-primary hover:underline font-medium">Registrieren</button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground space-x-4">
          <button className="hover:underline">Nutzungsbedingungen</button>
          <span>•</span>
          <button className="hover:underline">Datenschutz</button>
        </div>
      </div>
    </div>
  )
}
