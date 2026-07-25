using System.Text.Json;
using BeerVote.Dtos;
using BeerVote.Errors;
using BeerVote.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://0.0.0.0:8080");

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

builder.Services.AddSingleton<BeerCatalog>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<VoteService>();
builder.Services.AddSingleton<ResultsService>();

var app = builder.Build();

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (ApiException ex)
    {
        context.Response.StatusCode = ex.Status;
        await context.Response.WriteAsJsonAsync(new ErrorResponse(ex.Message, ex.Status));
    }
    catch (BadHttpRequestException ex)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsJsonAsync(new ErrorResponse(ex.Message, 400));
    }
    catch (JsonException ex)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsJsonAsync(new ErrorResponse(ex.Message, 400));
    }
});

app.MapGet("/health", () =>
    Results.Ok(new HealthResponse("ok", "beer-vote", "dotnet-aspnet")));

app.MapGet("/v1/beers", (BeerCatalog catalog) =>
{
    var items = catalog.ListAll()
        .Select(b => new BeerItem(b.Id, b.Name))
        .ToList();
    return Results.Ok(new BeerListResponse(items));
});

app.MapPost("/v1/users", (CreateUserRequest? request, UserService users) =>
{
    var created = users.Create(request);
    return Results.Created($"/v1/users/{created.Id}", created);
});

app.MapGet("/v1/users", (
    UserService users,
    int page = 1,
    int page_size = 20,
    string sort = "created_at",
    string order = "desc") => Results.Ok(users.List(page, page_size, sort, order)));

app.MapPost("/v1/votes", (CreateVoteRequest? request, VoteService votes) =>
{
    var created = votes.Cast(request);
    return Results.Created($"/v1/votes/{created.Id}", created);
});

app.MapGet("/v1/results", (ResultsService results) =>
    Results.Ok(results.GetResults()));

app.Run();
