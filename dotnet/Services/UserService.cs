using System.Collections.Concurrent;
using BeerVote.Dtos;
using BeerVote.Errors;
using BeerVote.Models;

namespace BeerVote.Services;

public sealed class UserService
{
    private readonly ConcurrentDictionary<Guid, User> _users = new();

    public UserResponse Create(CreateUserRequest? request)
    {
        var name = ValidateName(request?.Name);
        var user = new User(Guid.NewGuid(), name, DateTimeOffset.UtcNow);
        _users[user.Id] = user;
        return ToResponse(user);
    }

    public bool Exists(Guid id) => _users.ContainsKey(id);

    public UserListResponse List(int page, int pageSize, string sort, string order)
    {
        ValidatePagination(page, pageSize, sort, order);

        var comparer = ComparerFor(sort);
        if (string.Equals(order, "desc", StringComparison.OrdinalIgnoreCase))
        {
            comparer = Comparer<User>.Create((a, b) => comparer.Compare(b, a));
        }

        var sorted = _users.Values.ToList();
        sorted.Sort(comparer);

        var total = sorted.Count;
        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
        var from = Math.Min((page - 1) * pageSize, sorted.Count);
        var to = Math.Min(from + pageSize, sorted.Count);

        var items = sorted
            .GetRange(from, to - from)
            .Select(ToResponse)
            .ToList();

        return new UserListResponse(items, page, pageSize, total, totalPages);
    }

    private static string ValidateName(string? name)
    {
        if (name is null)
        {
            throw new ApiException(400, "name is required");
        }

        var trimmed = name.Trim();
        if (trimmed.Length is 0 or > 64)
        {
            throw new ApiException(400, "name must be 1..64 characters after trim");
        }

        return trimmed;
    }

    private static void ValidatePagination(int page, int pageSize, string sort, string order)
    {
        if (page < 1)
        {
            throw new ApiException(400, "page must be >= 1");
        }

        if (pageSize is < 1 or > 100)
        {
            throw new ApiException(400, "page_size must be 1..100");
        }

        var normalizedSort = sort?.ToLowerInvariant() ?? "";
        if (normalizedSort is not ("name" or "created_at" or "id"))
        {
            throw new ApiException(400, "sort must be one of: name, created_at, id");
        }

        var normalizedOrder = order?.ToLowerInvariant() ?? "";
        if (normalizedOrder is not ("asc" or "desc"))
        {
            throw new ApiException(400, "order must be one of: asc, desc");
        }
    }

    private static Comparer<User> ComparerFor(string sort) =>
        sort.ToLowerInvariant() switch
        {
            "name" => Comparer<User>.Create((a, b) =>
            {
                var nameCmp = string.Compare(a.Name, b.Name, StringComparison.OrdinalIgnoreCase);
                return nameCmp != 0 ? nameCmp : a.Id.CompareTo(b.Id);
            }),
            "id" => Comparer<User>.Create((a, b) => a.Id.CompareTo(b.Id)),
            _ => Comparer<User>.Create((a, b) =>
            {
                var timeCmp = a.CreatedAt.CompareTo(b.CreatedAt);
                return timeCmp != 0 ? timeCmp : a.Id.CompareTo(b.Id);
            }),
        };

    private static UserResponse ToResponse(User user) =>
        new(user.Id, user.Name, user.CreatedAt);
}
