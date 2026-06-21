create table watch_parties (
    id uuid primary key,
    title varchar(120) not null,
    description varchar(1000),
    scheduled_at timestamp with time zone not null,
    genre varchar(80) not null,
    max_participants integer not null,
    status varchar(20) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint watch_parties_max_participants_positive check (max_participants > 0),
    constraint watch_parties_status_valid check (status in ('PLANNED', 'LIVE', 'FINISHED', 'CANCELLED'))
);
