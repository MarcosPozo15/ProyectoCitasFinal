import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim(),
        role: dto.role,
        isActive: true,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async createInitialSuperadmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('El superadmin ya existe');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim(),
        role: PlatformRole.SUPERADMIN,
        isActive: true,
      },
    });
  }
}