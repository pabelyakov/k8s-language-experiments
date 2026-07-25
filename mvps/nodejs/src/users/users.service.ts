import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  create(dto: CreateUserDto): User {
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      created_at: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  exists(id: string): boolean {
    return this.users.has(id);
  }

  list(query: ListUsersQueryDto) {
    const { page, page_size, sort, order } = query;
    const sorted = [...this.users.values()].sort((a, b) => this.compare(a, b, sort, order));

    const total = sorted.length;
    const total_pages = total === 0 ? 0 : Math.ceil(total / page_size);
    const from = Math.min((page - 1) * page_size, sorted.length);
    const to = Math.min(from + page_size, sorted.length);
    const items = sorted.slice(from, to);

    return {
      items,
      page,
      page_size,
      total,
      total_pages,
    };
  }

  private compare(a: User, b: User, sort: string, order: string): number {
    let result = 0;

    switch (sort) {
      case 'name':
        result = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        if (result === 0) {
          result = a.id.localeCompare(b.id);
        }
        break;
      case 'id':
        result = a.id.localeCompare(b.id);
        break;
      case 'created_at':
      default:
        result = a.created_at.localeCompare(b.created_at);
        if (result === 0) {
          result = a.id.localeCompare(b.id);
        }
        break;
    }

    return order === 'desc' ? -result : result;
  }
}
