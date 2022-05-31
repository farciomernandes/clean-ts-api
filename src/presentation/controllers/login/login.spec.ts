import { LoginController } from './login'
import { badRequest } from '../../helpers/http-helper'
import { InvalidParamError, MissingParamError } from '../../errors'
import { EmailValidator, HttpRequest } from '../signup/signup-protocols'

interface SutTypes {
  sut: LoginController
  emailValidatorStub: EmailValidator
}

const makeEmailValidtor = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}
const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidtor()
  const sut = new LoginController(emailValidatorStub)
  return {
    sut,
    emailValidatorStub
  }
}
const makeFakeHttpRequest = (): HttpRequest => ({
  body: {
    email: 'any_email@email.com',
    password: 'any_password'
  }
})

describe('Login Controller', () => {
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }

    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }

    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
  })

  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    await sut.handle(makeFakeHttpRequest())
    expect(isValidSpy).toHaveBeenCalledWith('any_email@email.com')
  })

  test('Should returns 400 from EmailValidator if invalid email provided', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpResponse = await sut.handle(makeFakeHttpRequest())
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
  })
})
